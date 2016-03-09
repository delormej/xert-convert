require('process');
const xert = require('./xert.js');
const tcx = require('./tcx-writer.js');

const commandLineArgs = require('command-line-args');
const cli = commandLineArgs([
    { name: 'username', alias: 'u' },
    { name: 'password', alias: 'p' },
    { name: 'workout', alias: 'w', description: 'Leaf node of the workout url, do not pass the full path.' }
]);

// Convert xert workout to tcx format.
function xertToTcx(username, password, workoutPath) {
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
                                    
                    var xw = tcx.writeTcx(workoutObj);
                    console.log(xw.toString());
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

    if (username == null || password == null || workoutPath == null) {
        console.log(cli.getUsage());
        return;
    }  

    xertToTcx(username, password, workoutPath);  
}

main();