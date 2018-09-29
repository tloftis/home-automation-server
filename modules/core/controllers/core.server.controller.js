'use strict';

exports.nullRequest = function (req, res) {
    res.status(404).json({
        message: 'Path Not Found'
    });
};

exports.renderServerError = function (req, res) {
    res.status(500).json({
        message: 'Something went wrong, Server Error'
    });
};
