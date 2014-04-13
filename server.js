
/*!
 * nodejs-express-mongoose-demo
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , passport = require('passport')

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , mongoose = require('mongoose')

// Bootstrap db connection
mongoose.connect(config.db)

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// bootstrap passport config
require('./config/passport')(passport, config)


var app = express()
// bootstrap express settings
require('./config/express')(app, config, passport)

// Start the app by listening on <port>
var port = process.env.PORT || 3000
var server = app.listen(port, function(){
  console.log("Express server listening on port " + port);
});
var io = require('socket.io').listen(server);
var clients = {};
var socketsOfClients = {};

// bootstrap sockets.io settings
require('./config/sockets')(app, passport, io)
// require('./config/sockets')(app, passport, io, clients, socketsOfClients)

// Bootstrap routes
require('./config/routes')(app, passport, io)
// require('./config/routes')(app, passport, io, clients, socketsOfClients)






// expose app
exports = module.exports = app
