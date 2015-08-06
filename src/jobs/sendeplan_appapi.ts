/// <reference path='../../typings.d.ts' />

import request = require('request');
import moment = require('moment');
import crypto = require('crypto');

var endpoint = process.argv[2];

var params = "537f94c69b86e95c";

var time = moment();
var str1 = moment(time).format('YYYY-MM-DDTHH:mm:ssZZ');
var nonce = params + str1 + "q2$B'b*x"; //nicht wirklich random, aber whatever
var nonceEncoded = new Buffer(nonce).toString('base64');
var str2 = new Buffer(sha1(nonce + str1 + "ev%cel,eV&dIj]Bycs]Ig@mEip)ij&")).toString('base64');

var wsseHeader = 'UsernameToken Username="lac0Von8hAp2Wyd8aT5G", PasswordDigest="' + str2 + '", Nonce="' + nonceEncoded + '", Created="' + str1 + '"';

var options: any = {
    url: 'http://api.rocketmgmt.de/schedule',
    headers: {
        'X-WSSE': wsseHeader,
        'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)'
    }
};

var response = {
    data: [],
    logs: []
};

function log(type: string, message: string, data: any = {}) {
    console.log(type, message, JSON.stringify(data));
    response.logs.push({type: type, message: message, data: data});
}

log('info', 'starting request to app api..', { options: options });

request(options, function(err, resp, body) {
    console.log("App api output: ");
    console.log(JSON.parse(body));

    if (resp.statusCode != 200) {
        log('error', 'app api responded with wrong response code ' + resp)
    }

    try {
        response.data = JSON.parse(body).schedule;
        log('info', 'seems like app api responded with valid data');
    } catch(e) {
        log('error', 'app api responded with invalid json', { response: body });
    }

    var apiOptions:any = {
        url: 'http://127.0.0.1:13337/jobs/result/sendeplan_appapi/SUPER_SECRET_CODE_NO_ONE_WILL_EVER_GET_IT_HAHA123',
        headers: {
            'X-RocketBeans-AuthToken': '123',
            "Content-Type": "application/json"
        },
        json: response
    };

    request.post(apiOptions, function(err, resp, body) {
        console.log('api response:');
        console.log(body);
        console.log(err);
    });
});

function sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
}
