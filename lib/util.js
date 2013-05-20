
require('colors');
var util = require('util');

var error = function (msg, e, full) {
        var fmt = '✘ ' + msg;
        if (e) {
            fmt += '\n' + (full && e.stack ? e.stack : e);
        }
        console.error(fmt.red);
    },

    formatError = function () {
        error(util.format.apply(null, arguments));
    },

    success = function (msg, depth) {
        var pre = '';
            ind = depth ? (depth*2) : 0;
        for (var i = 0; i < ind; i++) {
            pre += ' ';
        }
        console.log(pre + ('✔ ' + msg).green);
    },

    fatal = function (msg, e, code) {
        error(msg, e, true);
        process.exit(code || -1);
    };

module.exports = {
    error: error,
    formatError: formatError,
    success: success,
    fatal: fatal
};