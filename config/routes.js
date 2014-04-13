/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , rooms = require('../app/controllers/rooms')
  , auth = require('./middlewares/authorization')

/**
 * Route middlewares
 */

var roomAuth = [auth.requiresLogin, auth.room.hasAuthorization]

/**
 * Expose routes
 */

module.exports = function (app, passport, io) {

  // user routes
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session)
  app.get('/users/:userId', users.show)
  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin)
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/linkedin',
    passport.authenticate('linkedin', {
      failureRedirect: '/login',
      scope: [ 
        'r_emailaddress'
      ]
    }), users.signin)
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }), users.authCallback)

  app.param('userId', users.user)

  // room routes
  app.get('/rooms', rooms.index)
  app.get('/rooms/new', auth.requiresLogin, rooms.new)
  app.post('/rooms', auth.requiresLogin, rooms.create)
  app.get('/rooms/:id', auth.requiresLogin, rooms.show)
  app.get('/rooms/:id/edit', roomAuth, rooms.edit)
  app.put('/rooms/:id', roomAuth, rooms.update)
  app.del('/rooms/:id', roomAuth, rooms.destroy)

  app.post('/rooms/:id/join', auth.requiresLogin, function(res, req){
    rooms.join(res, req, io)
  });

  app.post('/rooms/:id/leave', auth.requiresLogin, function(res, req){
    rooms.leave(res, req, io)
  });

  var messages = require('../app/controllers/messages')
  app.post('/rooms/:id/message', auth.requiresLogin, function(res, req){
    messages.create(res, req, io)
  });
  // app.post('/rooms/:id/join', function(res, req) {
  //   console.log(res)
  // });

  // app.param('id', articles.load)
  app.param('id', rooms.load)

  // home route
  // app.get('/', articles.index)
  app.get('/', rooms.index)

  // comment routes
  // var comments = require('../app/controllers/comments')
  // app.post('/rooms/:id/comments', auth.requiresLogin, comments.create)
  // app.get('/rooms/:id/comments', auth.requiresLogin, comments.create)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)

}
