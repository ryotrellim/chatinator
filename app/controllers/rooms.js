
/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Room = mongoose.model('Room')
  , utils = require('../../lib/utils')
  , _ = require('underscore')



/**
 * -- Helper --
 *
 * loads a particular room.
 */
exports.load = function(req, res, next, id){
  Room.load(id, function (err, room) {
    if (err) return next(err)
    if (!room) return next(new Error('not found'))
    req.room = room
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
 * joins a particular room
 */
exports.join = function(req, res, io){
  var room = req.room
  var addUser = true;

  // Go through participants and update entire list
  for (var i = room.participants.length - 1; i >= 0; i--) {
    if(room.participants[i].user.toString() == req.user._id.toString())
    {
      // TODO: Send different API response (same status code?)
      console.log('VALIDATOR:  participant already exists.');
      addUser = false;
      break;
    }
  };

  if(room.user._id.toString() == req.user._id.toString()) {
    console.log('VALIDATOR:  user is creator.');
    addUser = false;
  }

  if(addUser) {
    room.addParticipant(req.user);
    io.sockets.emit('userJoined', {userName: req.user.username});
    // io.sockets.on('connection', function(socket) {
    //   socket.emit('userJoined', {userName: req.user.username});
    // });
  }

  res.send(201, req.room);
}

/**
 * Leaves a particular room
 */
exports.leave = function(req, res, io){
  var room = req.room
  var removeUser = false;

  for (var i = room.participants.length - 1; i >= 0; i--) {
    if(room.participants[i].user.toString() == req.user._id.toString())
    {
      removeUser = true;
      break;
    }
  };

  if(!removeUser) console.log('VALIDATOR:  user is not a participant.');

  if(room.user._id.toString() == req.user._id.toString()) {
    console.log('VALIDATOR:  user is creator and cannot leave the room.');
    removeUser = false;
  }

  if(removeUser) {
    room.removeParticipant(req.user);  // remove from db, then uypdate other users
    io.sockets.emit('userLeft', {userName: req.user.username});
  }

  res.send(201, req.room);
}


/**
 * Delete a room
 */
exports.destroy = function(req, res){
  var room = req.room
  room.remove(function(err){
    req.flash('info', 'Deleted successfully')
    res.redirect('/rooms')
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


/**
 * List
 */
exports.index = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
  var perPage = 30
  var options = {
    perPage: perPage,
    page: page
  }

  Room.list(options, function(err, rooms) {
    if (err) return res.render('500')
    Room.count().exec(function (err, count) {
      res.render('rooms/index', {
        title: 'rooms',
        rooms: rooms,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      })
    })
  })  
}


/**
 * New room page
 */
exports.new = function(req, res){
  res.render('rooms/new', {
    title: 'New Room',
    room: new Room({})
  })
}


/**
 * Create a room
 */
exports.create = function (req, res) {
  var room = new Room(req.body)
  room.user = req.user

  room.uploadAndSave(req.files.image, function (err) {
    if (!err) {
      req.flash('success', 'Successfully created room!')
      return res.redirect('/rooms/'+room._id)
    }

    res.render('rooms/new', {
      title: 'New Room',
      room: room,
      errors: utils.errors(err.errors || err)
    })
  })
}


/**
 * Edit room page
 */
exports.edit = function (req, res) {
  res.render('rooms/edit', {
    title: 'Edit ' + req.room.title,
    room: req.room
  })
}


/**
 * Update room
 */
exports.update = function(req, res){
  var room = req.room
  room = _.extend(room, req.body)

  room.uploadAndSave(req.files.image, function(err) {
    if (!err) {
      return res.redirect('/rooms/' + room._id)
    }

    res.render('rooms/edit', {
      title: 'Edit Room',
      room: room,
      errors: err.errors
    })
  })
}


/**
 * Show
 */
exports.show = function(req, res){
  res.render('rooms/show', {
    title: req.room.title,
    room: req.room,
    user: req.user
  })
}

