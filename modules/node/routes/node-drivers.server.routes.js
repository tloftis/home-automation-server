'use strict';

const drivers = require('../controllers/node-drivers.server.controller.js');

module.exports = function (app) {
    app.route('/api/driver').
        get(drivers.list);

    app.route('/api/driver/:driversId').
        delete(drivers.removeDriver);

    app.param('driversId', drivers.driverById);
};
