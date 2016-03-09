/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module to write an ERG file format workout.
 * Specification of ERG format based on TrainerRoad: 
 * http://support.trainerroad.com/hc/en-us/articles/201944204-Creating-a-Workout-from-an-ERG-or-MRC-File
 */

// Use this offset for the low target. Targets are set as low & high watt range.  
const LOW_OFFSET_WATTS = 5; 
const COURSE_HEADER = '[COURSE HEADER]\r\n' +
            'VERSION=2\r\n' +
            'UNITS=ENGLISH\r\n' +
            'DESCRIPTION={0}\r\n' +
            'MINUTES\tWATTS\r\n' +
            '[END COURSE HEADER]\r\n' +
            '[COURSE DATA]\r\n';

const COURSE_LINE = '{0}\t{1}\r\n';   
const COURSE_TEXT = '{0:d}\t{1}\t{2:d}\r\n'; // Start time (seconds), Text, Duration (seconds)
const COURSE_TEXT_START = '[END COURSE DATA]\r\n[COURSE TEXT]\r\n';
const COURSE_TEXT_END = '[END COURSE TEXT]';
const DEFAULT_TEXT_DURATION = 15;

// Define module exports.
exports.writeErg = writeErg;

// Tracks the elapsed workout minutes.
var elapsedMins = 0.0;

// Formats the course line. 
function formatCourseLine(time, watts) {
    var output = COURSE_LINE.replace(/\{0\}/g, 
        Number(time).toFixed(2)).replace(/\{1\}/g, watts);
    
    return output;    
}

// Writes an individual power target steps.
function writeStep(step) {
    var output = '';
    
    // Number(step.duration).toFixed(2)
    
    for(i = 0; i < step.interval_count; i++) {
        // Write the active entry.
        output += formatCourseLine(elapsedMins, step.power);
        
        // Write the end of that step.
        elapsedMins += (step.duration / 60);
        output += formatCourseLine(elapsedMins, step.power);
                
        if (step.interval_count > 1) {
            // We're in an interval, so write the rest step.
            output += formatCourseLine(elapsedMins, step.power_rest);
            
            elapsedMins += (step.duration_rest / 60);
            
            // Write the end.
            output += formatCourseLine(elapsedMins, step.power_rest);
        }
    }

    return output;
}

// Converts xert json workout to ERG file format, returns a string.
function writeErg(workout) {
    var output = '';

    // Write header.
    output += COURSE_HEADER.replace(/\{0\}/g, workout.name);
    
    // Write Steps.
    workout.workout.forEach(function(step, index, arr) {
        output += writeStep(step);
    }); 

    output += COURSE_TEXT_START;
    output += COURSE_TEXT_END; 

    return output;
}  
