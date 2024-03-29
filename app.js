var scribe = require('scribe-js')();
var console = process.console;

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var directory = require('./routes/directory');
var image = require('./routes/image');
var galleries = require('./routes/galleries');
var download = require('./routes/download');
var cache = require('./routes/cache');
var tags = require('./routes/tags');
var persons = require('./routes/persons')
var stats = require('./routes/stats')
var trash = require('./routes/trash')
var users = require('./routes/users')
var sessionRoutes = require('./routes/session')
var favorites = require('./routes/favorites')
var config = require('config');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);


var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
  store: new RedisStore(),
  secret: 'key',
  secure: false,
  resave: false,
  saveUninitialized: false
}));

app.use(favicon());

app.use(logger('dev'));

// app.use(scribe.express.logger());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next) {
    req.config = config;
    next();
});

app.use(function(req, res, next) {
    if (req.session.user) {
        return next();
    }

    if (req.path === '/api/session') {
        return next();
    }

    if (req.path === '/api/users') {
        return next();
    }

    if (req.path.startsWith('/api/persons/') && req.path.endsWith('/image')) {
        return next();
    }

    return res.status(401).send("No Profile selected.");
});

app.use('/logs', scribe.webPanel());

app.use('/api/directories', directory);
app.use('/api/images', image);
app.use('/api/galleries', galleries);
app.use('/api/download', download);
app.use('/api/tags', tags);
app.use('/api/cache', cache);
app.use('/api/persons', persons);
app.use('/api/stats', stats);
app.use('/api/trash', trash);
app.use('/api/users', users);
app.use('/api/session', sessionRoutes);
app.use('/api/favorites', favorites);

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
