
var debug = require('debug')('app:user');

module.exports = function (config) {

    return {

        index: function (action) {
            debug('user.index');
            action.done({
                message: 'hola mundo!'
            });
        },

        search: function (action) {
            debug('user.search');
            action.done('bonjour le monde!');
        }

    };
};