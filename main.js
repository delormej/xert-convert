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
    { name: 'workout', alias: 'w', description: 'Leaf node of the workout url, do not pass the full path.' },
    { name: 'erg', alias: 'e', type: Boolean, defaultOption: false, defaultValue: false, description: 'Specify ERG file output.' },
    { name: 'tcx', alias: 't', type: Boolean, defaultOption: true, defaultValue: true, description: 'Specify ERG file output.' }
]);

// Convert xert workout to tcx format.
function xertToTcx(username, password, workoutPath, outputTcx, outputErg) {
    xert.authXert(username, password, function(err, accessToken) {
        if (err) {
            console.log('problem with request:', err);
        }
        else {
            xert.getXertWorkout(accessToken, workoutPath, function(err, workoutObj) {
                if (workoutObj.success == true) {
                    //console.log(workoutObj);
                    
                    // Use path as the name if missing.
                    if (workoutObj.name == null) {
                        workoutObj.name = workoutPath;
                    }

                    if (outputTcx) {
                        var xw = tcx.writeTcx(workoutObj);
                        console.log(xw.toString());
                    }
                    
                    if (outputErg) {
                        var output = erg.writeErg(workoutObj);
                        console.log(output)
                    }
                }
                else {
                    console.log('Could not load workout.');
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
    var outputTcx = args.tcx;
    var outputErg = args.erg;

    if (username == null || password == null || workoutPath == null) {
        console.log(cli.getUsage());
        return;
    }  

    xertToTcx(username, password, workoutPath, outputTcx, outputErg);
}

main();