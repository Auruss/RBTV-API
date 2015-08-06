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
        var response = new controller.ResponseData();

        super.getModel('shows').cached('default').findAll({}).then((data) => {
            response.addModel('shows', data);
            reply(response);
        }, () => {
            response.addError('DB_FAILURE', 'Failed to fetch data from storage');
            reply(response);
        });
    }
}
