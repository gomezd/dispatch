
var fs = require('fs'),
    log = require('./util'),
    path = require('path'),
    util = require('util'),
    yaml = require('js-yaml'),
    cons = require('consolidate'),
    async = require('async'),
    express = require('express'),
    middleware = require('./middleware'),

    debug = require('debug')('app:dispatcher'),

    basename = path.basename,
    join = path.join,

    baseDir = process.cwd(),
    configFile = join(baseDir, 'routes.yaml'),
    controllersDir = join(baseDir, 'controllers'),
    viewsDir = join(baseDir, 'views'),

    config,
    routes,
    controllers = {},
    app = express(),

    configure = function (callback) {
        app.engine('html', cons.handlebars);
        app.set('view engine', 'html');
        app.set('views', viewsDir);
        callback(null, app);
    },

    loadActions = function (callback) {
        debug('Loading controllers');
        fs.readdir(controllersDir, function (err, files) {
            if (err) {
                callback(err);
            } else {
                async.each(files, function (file, done) {
                    var fullPath = join(controllersDir, file),
                        name = basename(file, '.js'),
                        load = function () {
                            return require(fullPath);
                        };

                    controllers.__defineGetter__(name, load);
                    debug('Attached %s', name);
                    done();
                }, function () {
                    callback(null, controllers);
                });
            }
        });
    },

    mountRoutes = function (callback) {
        config = require(configFile);
        routes = config.routes,

        debug('Mounting routes');
        async.each(Object.keys(routes), function (path, done) {
            var handlers,

                route = routes[path],
                methods = route.methods || ['get'],
                config = route.config || {},

                parts = route.action.split('.'),
                module = parts[0],
                action = parts[1],

                controller,
                actionFn,
                view = (config.view) ? config.view.replace(/\./g, '/') : util.format('%s/%s', module, action),

                dispatch = function (req, res, next) {
                    var context = {
                            req: req,
                            res: res,

                            done: function (data) {
                                if (!data) {
                                    return next();
                                }
                                if (typeof data === 'string') {
                                    return res.send(data);
                                }
                                debug('Rendering %s', view);
                                res.render(view, data, function (err, html) {
                                    if (err) {
                                        return next(err);
                                    }
                                    res.send(html);
                                });
                            },

                            error: function (err) {
                                next(err);
                            }
                        };
                    actionFn(context);
                };

            if (!controllers[module]) {
                log.formatError('Failed to load path %s. Module %s not found', path, module);
                return done();
            }
            controller = controllers[module](config);

            actionFn = controller[action];
            if (!actionFn) {
                log.formatError('Failed to load path %s. Action %s not found', path, action);
                return done();
            }

            handlers = [
                dispatch,
                middleware.noContentHandler()
            ];

            async.each(methods, function (method, next) {
                app[method].call(app, path, handlers);
                debug('Mounted %s > %s(%s.%s)', path, method, module, action);
                next();
            }, done);

        }, function () {
            debug('Mounted error handler.');
            app.use(middleware.errorHandler());
            callback(null, app);
        });
    };

module.exports = {

    start: function (callback) {
        async.series([
            configure,
            loadActions,
            mountRoutes
        ], function (err) {
            callback(err, app);
        });
    }
};
