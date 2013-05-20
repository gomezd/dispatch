
var debug = require('debug')('app:foo');

module.exports = function (config) {

    return {

        bar: function (action) {
            debug('foo.bar');
            action.error('FUBAR!');
        }

    };
};