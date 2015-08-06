var Notification;
(function (Notification) {
    (function (Type) {
        Type[Type["Alert"] = 0] = "Alert";
        Type[Type["Popup"] = 1] = "Popup";
    })(Notification.Type || (Notification.Type = {}));
    var Type = Notification.Type;
    var SUCCESS_AUTO_CLOSE = 5;
    /**
     * Shows an new error notification
     *
     * @param message
     * @param type
     */
    function error(message, type) {
        if (type === void 0) { type = Type.Alert; }
        if (type == Type.Alert) {
            Metronic.alert({
                message: message,
                type: 'danger'
            });
        }
    }
    Notification.error = error;
    /**
     * Shows an new success notification
     * @param message
     * @param type
     */
    function success(message, type) {
        if (type === void 0) { type = Type.Popup; }
        if (type == Type.Alert) {
            Metronic.alert({
                message: message,
                type: 'success',
                closeInSeconds: SUCCESS_AUTO_CLOSE
            });
        }
    }
    Notification.success = success;
})(Notification || (Notification = {}));
/// <reference path="../../../../assets/global/scripts/global.d.ts" />
var Table;
(function (Table) {
    /**
     * Gets all base options for datatable plugin from base options
     * @param options
     * @returns {any}
     */
    function getDatatableOptions(options) {
        var dt = {};
        dt.saveState = options.saveState;
        if (options.allowColumnReorder) {
            dt.dom = 'Rlfrtip';
        }
        return dt;
    }
    /**
     * Initializes an table whose individual rows can be expanded by clicking the more button
     */
    function initExpandTable(selector, getter, options) {
        if (options === void 0) { options = {}; }
        // load options
        var defaults = {
            saveState: true,
            allowColumnReorder: true,
            dataField: 'index',
            autoOpenUrlParam: true,
            autoSetUrlParam: true,
            allowMultipleExpands: false
        };
        options = $.extend(false, {}, defaults, options);
        // create metronic table
        var table = $(selector);
        var dataTable = table.dataTable(getDatatableOptions(options));
        // state
        var currentOpen = null;
        // helper
        var close = function (me, rrow) {
            me.addClass("row-details-close").removeClass("row-details-open");
            dataTable.fnClose(rrow);
        };
        var open = function (me, rrow, identifier) {
            me.addClass("row-details-open").removeClass("row-details-close");
            dataTable.fnOpen(rrow, getter(identifier), 'details');
            if (currentOpen != null && !options.allowMultipleExpands) {
                dataTable.fnClose(currentOpen);
            }
            if (options.autoSetUrlParam) {
                history.replaceState({}, '', URLHelper.appendParameter('open' + selector, identifier));
            }
            currentOpen = rrow;
        };
        // Auto open
        if (options.autoOpenUrlParam) {
            var value = URLHelper.getParameterByName('open' + selector);
            var found = false;
            if (value != '') {
                table.find('tr').each(function (index, row) {
                    if ($(row).data(options.dataField) == value) {
                        found = true;
                        open($(row).find('.row-details-close'), row, value);
                    }
                });
                if (!found) {
                    Notification.error('No such entry found');
                }
            }
        }
        // handle the "more" buttons
        table.find(".row-details").on('click', function (e) {
            var me = $(event.currentTarget);
            var row = $(event.currentTarget).parents('tr');
            var rrow = row.get(0);
            var identifier = row.data(options.dataField);
            if (dataTable.fnIsOpen(rrow)) {
                close(me, rrow);
            }
            else {
                open(me, rrow, identifier);
            }
        });
    }
    Table.initExpandTable = initExpandTable;
})(Table || (Table = {}));
