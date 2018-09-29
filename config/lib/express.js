'use strict';

/**
 * Module dependencies.
 */
const config = require('../config'),
    express = require('express'),
    morgan = require('morgan'),
    logger = require('./logger'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    consolidate = require('consolidate'),
    path = require('path');

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;

    if (config.secure && config.secure.ssl === true) {
        app.locals.secure = config.secure.ssl;
    }

    app.locals.keywords = config.app.keywords;
    app.locals.livereload = config.livereload;

    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.host = req.protocol + '://' + req.hostname;
        res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
        next();
    });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
    // Showing stack errors
    app.set('showStackError', true);
    // Enable jsonp
    app.enable('jsonp callback');

    // Should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Enable logger (morgan)
    app.use(morgan(logger.getFormat(), logger.getOptions()));

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Disable views cache
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    app.use(methodOverride());
    // Add the cookie parser and flash middleware
    app.use(cookieParser());
    app.use(flash());
};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function (app) {
    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);
    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './');
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app, db) {
    // TODO: Add token verification here
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function (app, db) {
    config.files.server.configs.forEach(function (configPath) {
        require(path.resolve(configPath))(app, db);
    });
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function (app) {
    // Globbing policy files
    config.files.server.policies.forEach(function (policyPath) {
        require(path.resolve(policyPath)).invokeRolesPolicies();
    });
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function (app) {
    // Globbing routing files
    config.files.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) {
            return next();
        }

        // Log it
        console.error(err.stack);
        // Redirect to error page
        res.redirect('/server-error');
    });
};

/**
 * Configure Socket.io
 */
module.exports.configureSocketIO = function (app, db) {
    // Load the Socket.io configuration
    let server = require('./socket.io')(app, db);
    // Return server object
    return server;
};

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
    // Initialize express app
    let _this = this;
    let app = express();

    // Initialize local variables
    _this.initLocalVariables(app);

    // Initialize Express middleware
    _this.initMiddleware(app);

    // Initialize Express session
    _this.initSession(app, db);

    // Initialize Modules configuration
    _this.initModulesConfiguration(app);

    // Initialize modules server authorization policies
    _this.initModulesServerPolicies(app);

    // Initialize modules server routes
    _this.initModulesServerRoutes(app);

    // Initialize error routes
    _this.initErrorRoutes(app);

    // Configure Socket.io
    app = _this.configureSocketIO(app, db);

    return app;
};
