var scribe = require('scribe-js')();
var console = process.console;

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var directory = require('./routes/directory');
var image = require('./routes/image');
var galleries = require('./routes/galleries');
var download = require('./routes/download');
var cache = require('./routes/cache');
var tags = require('./routes/tags');
var persons = require('./routes/persons')
var config = require('config');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());

app.use(logger('dev'));

// app.use(scribe.express.logger());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next) {
    req.config = config;
    next();
});

app.use('/logs', scribe.webPanel());

app.use('/api/directories', directory);
app.use('/api/images', image);
app.use('/api/galleries', galleries);
app.use('/api/download', download);
app.use('/api/tags', tags);
app.use('/api/cache', cache);
app.use('/api/persons', persons);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
