#! /usr/bin/env node

var dispatcher = require('./lib/dispatcher'),
    port = 9999;

dispatcher.start(function (err, app) {
    app.get('/hello', function(req, res){
        res.send('Hello World');
    });
    app.listen(port);
    console.log('Listening to port ', port);
});