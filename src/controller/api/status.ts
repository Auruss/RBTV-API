import controller = require("../../controller");

export class Controller extends controller.BaseController {
    setup() {
        super.addAction("GET", "/", "index");
    }

    /**
     * This is the index action
     * @param request
     * @param reply
     */
    index(request: controller.RequestData, reply) {
        super.log('debug', 'Status was requested -> we\'re fine', request);

        var response = new controller.ResponseData();
        response.addRawData('status', 'FINE' );

        reply(response);
    }
}