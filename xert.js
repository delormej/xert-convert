/*
 * Copyright (c) 2016 Inside Ride Technologies, LLC. All Rights Reserved.
 * Author: Jason De Lorme (jason@insideride.com)
 *
 * Module to load a workout from xertonline.com.
 */

const https = require('https')
const querystring = require('querystring');
const HOST = 'www.xertonline.com';
const XERT_AUTH = 'testclient:testpass';

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
         auth: XERT_AUTH,
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, (res) => {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
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

        res.on('data', (d) => {
            data += d;
        });

        res.on('error', (e) => {
            console.error(e);
        });
        
        res.on('end', () => {
            // console.log(data);
            var obj = JSON.parse(data);
            callback(null, obj);
        });
    });
}

