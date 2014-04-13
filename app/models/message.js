
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema

/**
 * Getters
 // TODO: getChats
 */


/**
 * Setters
 */


/**
 * Room Schema
 */

var MessageSchema = new Schema({
  body: {type : String, default : '', trim : true},
  user: {type : Schema.ObjectId, ref : 'User'},       // creator
  createdAt: { type : Date, default : Date.now },
})

/**
 * Validations
 */

MessageSchema.path('body').validate(function (body) {
  return body.length > 0
}, 'Message body cannot be blank')

/**
 * Pre-remove hooks
 */

/**
 * Methods
 */

MessageSchema.methods = {

  /**
   * Create message
   *
   * @param {User} user
   * @param {Object} message
   * @param {Function} cb
   * @api private
   */
  create: function (user, message, cb) {
    var notify = require('../mailer/notify')

    this.messages.push({
      body: message.body,
      user: user._id
    })

    notify.message({
      room: this,
      currentUser: user,
      message: message.body
    })

    this.save(cb)
  }

}

/**
 * Statics
 */

MessageSchema.statics = {

  /**
   * Find message by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .exec(cb)
  },

  /**
   * List messages
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

mongoose.model('Message', MessageSchema)
