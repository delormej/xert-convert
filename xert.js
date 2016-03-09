/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module to load a workout from xertonline.com.
 */

const https = require('https')
const querystring = require('querystring');
const HOST = 'www.xertonline.com';

// Define module exports.
exports.getXertWorkout = getXertWorkout;  
exports.authXert = authXert;

// Returns workout JSON from xert's website. 
function authXert(username, password, callback) {
  
    var postData = querystring.stringify({
         'grant_type' : 'password',
         'username' : username,
         'password' : password 
    });
    
    var options = {
         hostname: HOST,
         port: 443,
         method: 'POST',
         path: '/oauth/token',
         auth: 'testclient:testpass',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, (res) => {
        var data = '';
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            //console.log('No more data in response.')
            var obj = JSON.parse(data);
            callback(null, obj.access_token);
        })
    });

    req.on('error', (e) => {
        callback(e, null);
    });

    // write data to request body
    req.write(postData);
    req.end();
}

// Returns a JSON object containing the workout.
function getXertWorkout(accessToken, workout, callback) {
    //curl -X GET "https://www.xertonline.com/oauth/workout/janrtAEsW2B4niR9" -H "Authorization: Bearer 706b2ea00af696563f60a60b953a5d0a30055934 -k

    var options = {
         hostname: HOST,
         port: 443,
         method: 'GET',
         path: '/oauth/workout/' + workout,
         headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    https.get(options, (res) => {
        var data = '';
        //console.log('statusCode: ', res.statusCode);
        //console.log('headers: ', res.headers);

        res.on('data', (d) => {
            data += d;
        });

        res.on('error', (e) => {
            console.error(e);
        });
        
        res.on('end', () => {
            //console.log('data:', data);
            var obj = JSON.parse(data);
            callback(null, obj);
        });
    });
}

