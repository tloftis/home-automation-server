'use strict';

let nodeDriverPolicy = require('../policies/node-drivers.server.policy'),
    drivers = require('../controllers/node-drivers.server.controller.js');

module.exports = function (app) {
    app.route('/api/driver').all(nodeDriverPolicy.isAllowed).
        get(drivers.list);

    app.route('/api/driver/:driversId').all(nodeDriverPolicy.isAllowed).
        delete(drivers.removeDriver);

    app.param('driversId', drivers.driverById);
};
