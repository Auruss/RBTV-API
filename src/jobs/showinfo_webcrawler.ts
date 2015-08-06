/// <reference path="../../typings/phantomjs/phantomjs.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />

/**
 * Output data
 */
var resultData = {
    logs: [],
    data: []
};

/**
 * Adds a log entry into the result
 * @param type
 * @param message
 * @param data
 */
function log(type: string, message: string, data: any = {}) {
    console.log(type, message, JSON.stringify(data));

    resultData.logs.push({type: type, message: message, data: data});
}

log('info', 'Show web crawler started successfully');

var page: WebPage = require('webpage').create();

// Setup crawler
var url: string = "http://rocketbeans.tv/shows/";

page.open(url, {encoding: "utf8"}, function (status) {
    if (status !== 'success') {
        log('error', 'failed to open page', { status: status});
    } else {
        log('info', 'page opened successfully');

        page.onError = function (msg, trace:any) {
            log('error', 'page error', trace);
        };

        page.onConsoleMessage = function (msg) { console.log(msg); };

        var real_data = JSON.parse(page.evaluate(function(s) {
            var output = {
                logs: [],
                data: []
            };

            /**
             * Outputs a log
             * @param type
             * @param message
             * @param data
             */
            var inlog = function(type: string, message: string, data: any = {}) {
                console.log(type, message, JSON.stringify(data));
                output.logs.push({type: type, message: message, data: data});
            };
            inlog('info', 'evaluating page..');

            // iterate over show wrappers
            $('.show').each((index, element) => {
                // Image source
                var image_source = $(element).children('.show-image').children('img').attr('src');

                // Name
                var title:any = $(element).children('.show-desc').children('.show-text').children('h3');
                var titleText = title.html();
                title.remove();

                // Description
                var description = $(element).children('.show-desc').children('.show-text').html();

                // Is live
                var isLiveEl = $(element).children('show-desc').children('.show-info').children('span');
                isLiveEl.remove();

                // Info
                var info = $(element).children('.show-desc').children('.show-info').html();
                var isLive = info.indexOf('LIVE') != -1;

                // Result
                var res = {
                    image_source: image_source,
                    title: encodeURI(titleText.trim()),
                    description: encodeURI(description.trim()),
                    isLive: isLive,
                    info: encodeURI(info.trim())
                };
                output.data.push(res);

                // Log
                inlog('info', 'Found show entry', res);
            });

            return JSON.stringify(output);
        }));

        log('info', '... evaluating is done');
        log('info', 'show crawler finished working, found ' + real_data.data.length + ' entries');

        resultData.data = real_data.data;

        real_data.logs.forEach((log) => {
            resultData.logs.push(log);
        });

        console.log(JSON.stringify(resultData));

        // Send results to the api
        var apiPage = require('webpage').create(),
            server = 'http://127.0.0.1:13337/jobs/result/showinfo_webcrawler/SUPER_SECRET_CODE_NO_ONE_WILL_EVER_GET_IT_HAHA123',
            data = resultData;

        apiPage.customHeaders = {
            'X-RocketBeans-AuthToken': '123',
            "Content-Type": "application/json"};

        apiPage.onResourceError = function(resourceError) {
            console.log(JSON.stringify(resourceError));
        };

        apiPage.open(server, 'post', JSON.stringify(resultData), function (status) {
            if (status !== 'success') {
                console.log('Unable to post data to api!');
            } else {
                console.log('done! :)')
            }
            phantom.exit();
        });
    }
});
