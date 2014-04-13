
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Imager = require('imager')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , imagerConfig = require(config.root + '/config/imager.js')
  , Schema = mongoose.Schema

/**
 * Getters
 // TODO: getChats
 */

var getTags = function (tags) {
  return tags.join(',')
}


/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',')
}

/**
 * Room Schema
 */

var RoomSchema = new Schema({
  title: {type : String, default : '', trim : true},
  body: {type : String, default : '', trim : true},
  user: {type : Schema.ObjectId, ref : 'User'},       // creator
  comments: [{
    body: { type : String, default : '' },
    user: { type : Schema.ObjectId, ref : 'User' },
    createdAt: { type : Date, default : Date.now }
  }],
  tags: {type: [], get: getTags, set: setTags},
  // image: {
  //   cdnUri: String,
  //   files: []
  // },
  createdAt: { type : Date, default : Date.now },
  participants :[{
    user: { type : Schema.ObjectId, ref : 'User' },
    username: { type: String, ref : 'User' },
    dateJoined: { type : Date, default : Date.now }
  }] 
})

/**
 * Validations
 */

RoomSchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Room title cannot be blank')

RoomSchema.path('body').validate(function (body) {
  return body.length > 0
}, 'Room body cannot be blank')

/**
 * Pre-remove hook
 */

RoomSchema.pre('remove', function (next) {
  // var imager = new Imager(imagerConfig, 'S3')
  // var files = this.image.files

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err)
  // }, 'room')

  next()
})

/**
 * Methods
 */

RoomSchema.methods = {

  /**
   * Save room and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
    if (!images || !images.length) return this.save(cb)

    var imager = new Imager(imagerConfig, 'S3')
    var self = this

    imager.upload(images, function (err, cdnUri, files) {
      if (err) return cb(err)
      // if (files.length) {
      //   self.image = { cdnUri : cdnUri, files : files }
      // }
      self.save(cb)
    }, 'room')
  },

  // See Message (model and controller)
  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */
  // addComment: function (user, comment, cb) {
  //   var notify = require('../mailer/notify')

  //   this.comments.push({
  //     body: comment.body,
  //     user: user._id
  //   })

  //   notify.comment({
  //     room: this,
  //     currentUser: user,
  //     comment: comment.body
  //   })

  //   this.save(cb)
  // },


  /**
   * Add participant
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */
  addParticipant: function (user, cb) {
    // var notify = require('../mailer/notify')
    this.participants.push({
      user: user._id,
      username: user.username
    })

    // notify.participants({
    //   room: this,
    //   currentUser: user,
    //   comment: comment.body
    // })

    this.save(cb)
  },

  /**
   * Remove participant
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */
  removeParticipant: function (user, cb) {
    // var notify = require('../mailer/notify')
    for(var i = this.participants.length - 1; i >= 0; i--) {
      if(this.participants[i].user.toString() === user._id.toString()) {
        this.participants.splice(i, 1);
      }
    }

    // notify.participants({
    //   room: this,
    //   currentUser: user,
    //   comment: comment.body
    // })

    this.save(cb)
  }

}

/**
 * Statics
 */

RoomSchema.statics = {

  /**
   * Find room by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec(cb)
  },

  /**
   * List rooms
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }

}

mongoose.model('Room', RoomSchema)
