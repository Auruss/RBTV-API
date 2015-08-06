import g = require("../../global");
import controller = require("../../controller");
import jobs = require("../../jobs");
import orm = require("../../orm");

import _ = require("lodash");

export class Controller extends controller.BaseController {
    setup() {
        super.addAction("GET", "/execute/{jobname}/{key}", "execute");
        super.addAction("POST", "/result/{jobname}/{key}", "result");
    }

    /**
     * Handles input from external job runners
     *
     * @param request
     * @param reply
     */
    result(request: controller.RequestData, reply) {
        var response = new controller.ResponseData();

        // Get job
        var jobName = request.urlVariables['jobname'];
        var job = jobs.getJob(jobName);
        if (_.isUndefined(job)) {
            response.setStatus(400);
            response.addError('INVALID_JOB', 'Given job does not exist!');

            reply(response);
            return;
        }

        // Check key
        var key = request.urlVariables['key'];
        if (key != 'SUPER_SECRET_CODE_NO_ONE_WILL_EVER_GET_IT_HAHA123') {
            response.setStatus(400);
            response.addError('INVALID_KEY', 'Given key is invalid!!! I highly recommend you to stop with whatever you are trying! All errors are logged!');

            super.log("info", "Tried to add job result with wrong key", request, { givenKey: key, job: jobName });

            reply(response);
            return;
        }

        // Handle input
        super.log('info', 'Received valid job result request', request);
        var data = request.postData;

        // Handle logs
        data.logs.forEach((log) => {
            super.log(log.type, log.message, request, { host_type: 'job', data: log.data});
        });

        // Handle data
        data = data.data;

        switch (jobName) {
            case "showinfo_webcrawler":
                data.forEach((show, index) => {
                    // decode
                    var info = decodeURI(show.info);
                    var title = decodeURI(show.title);
                    var description = decodeURI(show.description);

                    // prepare info texts
                    var hashTagStart = info.indexOf('#');
                    var hashTagEnd = info.indexOf(' ', hashTagStart);
                    if (hashTagEnd == -1) hashTagEnd = info.length;

                    var hashTag = info.substring(hashTagStart, hashTagEnd);
                    var infoData = info.split(' | ');

                    // Date and time
                    var date = "";
                    var time = "";
                    if (infoData.length > 2) {
                        if (infoData[0] != 'Pausiert') {
                            date = infoData[0];
                            time = infoData[1];
                        }
                    }

                    // check if show entry already exists
                    super.getModel('shows').find({ where: {
                        name: title
                    }}).then((entry: any) => {
                        // build data
                        var db = {
                            website_id: index,
                            name: title,
                            image_url: show.image_source,
                            description: description,
                            is_live: show.isLive,
                            hashtag: hashTag,
                            schedule_date: date,
                            schedule_time: time
                        };

                        if (entry == null) {
                            // save
                            super.getModel('shows').create(db).then(() => {
                            });
                        } else {
                            super.getModel('shows').update(db, { where: {id: entry.id} });
                        }
                    });
                });

                // Response
                response.setStatus(200);
                response.addRawData('acknowledged', true);
                reply(response);

                break;

            case "sendeplan_appapi":
                // get shows
                super.getModel('shows').findAll({}).then((shows) => {

                    // show name converter
                    var converter = (org: string) => {
                        return org.toLowerCase().replace(' ', '')
                                  .replace('plus', '+');
                    };

                    // handle
                    data.forEach((entry) => {
                        var showLinkId = null;
                        var currentShow = converter(entry.show);

                        // find show link
                        shows.forEach((show:any) => {
                            var showLink = converter(show.name);
                            if (currentShow == showLink) {
                                showLinkId = show.id;
                                return false;
                            }
                        });

                        // log unknown show
                        if (showLinkId == null) {
                            super.log('warn', 'schedule contains an unknown show', request, { schedule: entry });
                        }

                        // build data
                        var db = {
                            api_id: entry.id,
                            title: entry.title,
                            topic: entry.topic,
                            api_showname: entry.show,
                            show_id: showLinkId,
                            typeName: entry.type,
                            gameName: entry.game,
                            timeStart: entry.timeStart,
                            timeEnd: entry.timeEnd,
                            duration: entry.length
                        };

                        super.getModel('schedule').find({ where: { api_id: entry.id }}).then((exists) => {
                            if (exists != null) {
                                // update
                                super.getModel('schedule').update(db, { where: {api_id: entry.id} });
                            } else {
                                // save
                                super.getModel('schedule').create(db);
                            }
                        });
                    });

                    response.setStatus(200);
                    response.addRawData('acknowledged', true);
                    reply(response);
                });

                break;

            default:
                super.log('error', 'TODO: add job result handler for: ' + jobName, request);

                // Response
                response.setStatus(400);
                response.addRawData('acknowledged', false);
                reply(response);

                break;
        }

    }

    /**
     * Allows manual execution of jobs
     *
     * @param request
     * @param reply
     */
    execute(request: controller.RequestData, reply) {
        var response = new controller.ResponseData();

        // Get job
        var jobName = request.urlVariables['jobname'];
        var jobConfig = g.Config.schedule[jobName];
        if (_.isUndefined(jobConfig)) {
            response.setStatus(400);
            response.addError('INVALID_JOB', 'Given job does not exist!');

            reply(response);
            return;
        }

        // Check key
        var key = request.urlVariables['key'];
        if (key != jobConfig.key) {
            response.setStatus(400);
            response.addError('INVALID_KEY', 'Given key is invalid!!! I highly recommend you to stop with whatever you are trying! All errors are logged!');

            super.log("info", "Tried to execute job with wrong key", request, { givenKey: key, job: jobName });

            reply(response);
            return;
        }


        // Execute job
        super.log("info", "Manually executing job '" + jobName + "'", request);

        var job = jobs.getJob(jobConfig.job);
        job.execute(jobConfig);

        // Response
        response.addRawData('acknowledged', true);
        reply(response);
    }
}