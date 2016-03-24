/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 * Requires: Node.js v4.x or greater.
 *
 * Simple test harness to convert xertonline.com workout to tcx.
 */

require('process');
const xert = require('./xert.js');
const tcx = require('./tcx-writer.js');
const erg = require('./erg-writer.js');

const commandLineArgs = require('command-line-args');
const cli = commandLineArgs([
    { name: 'username', alias: 'u' },
    { name: 'password', alias: 'p' },
    { name: 'output', alias: 'o', type: String, defaultValue: 'erg', description: 'Specify erg or tcx file output.' },
    { name: 'workout', alias: 'w', defaultOption: true, description: 'Leaf node of the workout url, do not pass the full path.' },
]);

// Convert xert workout to specified format.
function xertConvert(username, password, workoutPath, outputFormat) {
    xert.authXert(username, password, function(err, accessToken) {
        if (err) {
            throw new Error('problem with request:', err);
        }
        else {
            xert.getXertWorkout(accessToken, workoutPath, function(err, workoutObj) {
                if (workoutObj.success == true) {
                    
                    // DEBUG OUTPUT:
                    //console.log(workoutObj);
                    
                    // Use path as the name if missing.
                    if (workoutObj.name == null) {
                        workoutObj.name = workoutPath;
                    }

                    if (outputFormat === 'tcx') {
                        var xw = tcx.writeTcx(workoutObj);
                        console.log(xw.toString());
                    }
                    else if (outputFormat === 'erg') {
                        var output = erg.writeErg(workoutObj);
                        console.log(output)
                    }
                    else {
                        throw new Error('Invalid output format specified.');
                    } 
                    
                }
                else {
                    throw new Error('Could not load workout.');
                }
            });
        }
    });
}

function main() {
    // Parse command line.
    var args = cli.parse();

    // Required inputs:
    var username = args.username;  
    var password = args.password;
    var workoutPath = args.workout;
    var ouputFormat = args.output;

    if (username == null || password == null || workoutPath == null) {
        console.log(cli.getUsage());
        return;
    }  

    xertConvert(username, password, workoutPath, ouputFormat);
}

main();