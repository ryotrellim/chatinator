
/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Message = mongoose.model('Message')
  , utils = require('../../lib/utils')
  , _ = require('underscore')



/**
 * -- Helper --
 *
 * loads a particular message.
 */
exports.load = function(req, res, next, id){
  Message.load(id, function (err, message) {
    if (err) return next(err)
    if (!message) return next(new Error('not found'))
    req.message = message
    next()
  })
}

/**
 *
 * 
 *
 * ~~ API ~~
 *
 *
 *
 **/

/**
 * Create a message
 */
exports.create = function (req, res, io) {
  var message = new Message(req.body)
  var room = req.room;
  message.user = req.user

  var createComment = false;
  // Go through participants and determine if eligible to message
  for (var i = room.participants.length - 1; i >= 0; i--) {
    if(room.participants[i].user.toString() == req.user._id.toString())
    {
      // TODO: Send different API response (same status code?)
      createComment = true;
      break;
    }
  };


  if(room.user._id.toString() == req.user._id.toString()) {
    createComment = true;
  }

  if(createComment) {
    io.sockets.emit('message', {userName: req.user.username, message: message});
  } else {
    console.log('VALIDATOR:  Unable to send message.  User is not a participant or creator.');
  }
  res.send(201, req.message);
}


/**
 * Delete message room
 */
exports.destroy = function(req, res){
  var message = req.message
  message.remove(function(err){
    req.flash('info', 'Deleted successfully')
  })
}


/**
 *
 * 
 *
 * -- Views -- 
 *
 *
 *
 **/
