import controller = require("../../controller");
import _ = require("lodash");

import moment = require('moment');

export class Controller extends controller.BaseController {
    setup() {
        super.addAction("GET", "/all/{page?}", "all");
        super.addAction("GET", "/{page?}", "index");
    }

    /**
     * Retrieves all saved schedules, maximum of 25
     *
     * @param request
     * @param reply
     */
    all(request: controller.RequestData, reply) {
        var response = new controller.ResponseData();

        var page = request.urlVariables['page'] | 0;

        super.getModel('schedule').cached('default').findAll({
            offset: 25 * page,
            limit: 25,
            include: [{ model: super.getModel('shows') }]
        }).then((data) => {
            response.addModel('schedule', data);
            reply(response);
        }, (reason) => {
            response.addError('DB_FAILURE', 'Failed to fetch data from storage');
            console.log(reason);
            reply(response);
        });
    }

    /**
     * Retrieves all scheduled shows between -12h and +12h form now.
     *
     * @param request
     * @param reply
     */
    index(request: controller.RequestData, reply) {
        var response = new controller.ResponseData();

        // handle parameter
        var page = 0;
        var negative = false;

        if (_.isUndefined(request.urlVariables['page'])) {
            page = 0;
        } else {
            page = request.urlVariables['page'];

            if (page < 0) negative = true;
            page = Math.abs(page);
        }

        // set current date
        if (negative) {
            var current = moment().subtract(page * 12, 'hours');
        } else {
            var current = moment().add(page * 12, 'hours');
        }

        // set time conditions
        var start = moment(current).subtract(12, 'hours');
        var end = moment(current).add(12, 'hours');

        super.getModel('schedule').cached('default').findAll({
            where: {
                'timeStart': {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                }
            },
            order: [['timeStart', 'ASC']],
            include: [{ model: super.getModel('shows') }]
        }).then((data) => {
            response.addModel('schedule', data);
            reply(response);
        }, (reason) => {
            response.addError('DB_FAILURE', 'Failed to fetch data from storage');
            console.log(reason);
            reply(response);
        });
    }


}
