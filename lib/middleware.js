
var debug = require('debug')('app:middleware'),
    util = require('./util'),

    noContent = function (options) {
        return function noContentHandler (req, res) {
            debug('No Content handler: %s', req.url);
            res.send(204);
        };
    },

    error = function (options) {
        return function errorHandler (err, req, res, next) {
            debug("Error handler: %s", req.url);
            util.error('Failed to handle ' + req.url, err, true);
            res.render('error', {error: err}, function (err, html) {
                res.send(500, html);
            });
        };
    };

module.exports = {
    noContentHandler: noContent,
    errorHandler: error
};
