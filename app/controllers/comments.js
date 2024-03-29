
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

/**
 * Create comment
 */

exports.create = function (req, res) {
  var room = req.room
  var user = req.user

  if (!req.body.body) return res.redirect('/rooms/'+ room.id)

  room.addComment(user, req.body, function (err) {
    if (err) return res.render('500')
    res.redirect('/rooms/'+ room.id)
  })
}
