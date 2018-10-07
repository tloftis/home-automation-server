'use strict';

module.exports = (app) => {
    let core = require('../controllers/core.server.controller');
    app.route('/server-error').get(core.renderServerError);

    //These should not be able to be hit
    app.route('/:url(api|modules|lib)/*').get(core.nullRequest);
    app.route('/*').get(core.nullRequest);
};
