
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Notifier = require('notifier')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]

/**
 * Notification methods
 */

var Notify = {

  /**
   * Comment notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  comment: function (options, cb) {
    var room = options.room
    var author = room.user
    var user = options.currentUser
    var notifier = new Notifier(config.notifier)

    var obj = {
      to: author.email,
      from: 'your@product.com',
      subject: user.name + ' added a comment on your room ' + room.title,
      alert: user.name + ' says: "' + options.comment,
      locals: {
        to: author.name,
        from: user.name,
        body: options.comment,
        room: room.name
      }
    }

    // for apple push notifications
    /*notifier.use({
      APN: true
      parseChannels: ['USER_' + author._id.toString()]
    })*/

    notifier.send('comment', obj, cb)
  }
}

/**
 * Expose
 */

module.exports = Notify
