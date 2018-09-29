'use strict';

module.exports = (app) => {
    let core = require('../controllers/core.server.controller');
    app.route('/server-error').get(core.renderServerError);

    app.route('/:url(api|modules|lib)/*').get(core.nullRequest);
    app.route('/*').get(core.nullRequest);
};
