/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module to generate a Garmin tcx workout schema with power targets.
 */

const XMLWriter = require('xml-writer');
// Use this offset for the low target. Targets are set as low & high watt range.  
const LOW_OFFSET_WATTS = 5; 

// Define module exports.
exports.writeTcx = writeTcx;  

// Helper function writes out the xsi:type attribute.
function writeType(xw, type) {
    xw.writeAttributeNS('xsi', 'type', '', type);
}

// Name is limited to 15 chars, grab first 15 chars.
function getName(step) {
    var name = '';
    
    if (step.name.length > 15) {
        name = step.name.substring(0, 14);
    } 
    else {
        name = step.name;
    }

    return name;
}

// Helper function to get the right power value and round it.
function getPower(step, isResting) {
    var power = 0;
                        
    if (isResting) {
        power = Math.round(step.power_rest);
    } 
    else {
        power = Math.round(step.power);
    }
    
    return power;
}

// Write common elements for a step.
function writeStepDetails(xw, 
            index,
            name,
            duration,  
            intensity) {
    
    xw.writeElement('StepId', index);
    xw.writeElement('Name', name);
    xw.startElement('Duration');
        writeType(xw, 'Time_t');
    
    xw.writeElement('Seconds', duration);
    xw.endElement(); // Duration
    xw.writeElement('Intensity', intensity);   
}

// Writes the target element.
function writeTarget(xw, step, isResting) {
    var power = 0;                         

    xw.startElement('Target');
    if (step == null) {
        writeType(xw, 'None_t');
    } 
    else {
        power = getPower(step, isResting);

        writeType(xw, 'Power_t');
        xw.startElement('PowerZone');
        writeType(xw, 'CustomPowerZone_t');
        xw.startElement('Low');
        writeType(xw, 'PowerInWatts_t');
        xw.writeElement('Value', power - LOW_OFFSET_WATTS);
        xw.endElement(); // Low
        xw.startElement('High');
        writeType(xw, 'PowerInWatts_t');
        xw.writeElement('Value', power);
        xw.endElement(); // High   
        xw.endElement(); // PowerZone   
    }
    xw.endElement(); // Target   
}

// Opens  the <Step> element and builds common elements.
// Returns an offset if this was a repeat (with nested children)
function writeStep(xw, step, index, inExtension) {
    var name = getName(step);
    var interval = (step.duration_rest != null && step.power_rest != null);
    
    xw.startElement('Step');
    
    // Create Repetitions if this is an interval
    if (!inExtension && interval == true) {
        writeType(xw, 'Repeat_t');        
    }
    else {
        writeType(xw, 'Step_t');
    }
    
    if (interval) {
        if (!inExtension) {
            // Advance index past the active & rest steps.
            xw.writeElement('StepId', index+2);
            
            xw.writeElement('Repetitions', step.interval_count);
            xw.startElement('Child');
            writeType(xw, 'Step_t');
        }
        
        // Active step.
        writeStepDetails(xw, 
            index++,
            name,
            step.duration,  
            'Active');
        writeTarget(xw, inExtension ? step : null, false);
        xw.endElement(); // Child or Step (powerZone)
        
        // Recovery step.
        if (!inExtension) {
            xw.startElement('Child');
        }
        else {
            xw.startElement('Step');
        }
        
        writeType(xw, 'Step_t');
        writeStepDetails(xw, 
            index++,
            name,
            step.duration_rest,  
            'Resting');        
        writeTarget(xw, inExtension ? step : null, true);
        xw.endElement(); // Child or Step
        
        if (!inExtension) {
            // Advance to accomodate for outer step index.
            index++;          
        }
    }        
    else {
        writeStepDetails(xw, 
            index++,
            name,
            step.duration,  
            'Active');  
        writeTarget(xw, inExtension ? step : null, false);
        
        if (inExtension) {
            xw.endElement(); // Step
        }
    }   

    if (!inExtension) {
        xw.endElement(); // Step
    }
            
    return index;
}

// Converts xert json workout to Garmin TCX, returns an xml-writer.
function writeTcx(workout) {
    // Write the TCX xml according to Garmin schema.
    var xw = new XMLWriter();
    xw.startDocument();
    xw.startElement('TrainingCenterDatabase');
    xw.writeAttribute('xmlns', 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2');
    xw.writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    xw.startElement('Workouts');
    xw.startElement('Workout');
    xw.writeAttribute('Sport', 'Biking');
    xw.writeElement('Name', workout.name);

    var nextStepIndex = 1;

    // Write Steps without targets.
    workout.workout.forEach(function(step, index, arr) {
        nextStepIndex = writeStep(xw, step, nextStepIndex, false);
    }); 

    // Use Extensions element to specify power target. (duplicates steps)                
    xw.startElement('Extentions');
    xw.startElement('Steps');
    xw.writeAttribute('xmlns', 'http://www.garmin.com/xmlschemas/WorkoutExtension/v1');

    // Reset step count.
    nextStepIndex = 1;
    workout.workout.forEach(function(step, index, arr) {
        nextStepIndex = writeStep(xw, step, nextStepIndex, true);
    });
    
    xw.endElement(); // Steps 
    
    xw.endElement(); // Extensions
    
    xw.endElement(); // Workout
    xw.endElement(); // Workouts  
    xw.endDocument();

    return xw;
}
