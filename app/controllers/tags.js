/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Room = mongoose.model('Room')

/**
 * List items tagged with a tag
 */

exports.index = function (req, res) {
  var criteria = { tags: req.param('tag') }
  var perPage = 5
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
  var options = {
    perPage: perPage,
    page: page,
    criteria: criteria
  }

  Room.list(options, function(err, rooms) {
    if (err) return res.render('500')
    Room.count(criteria).exec(function (err, count) {
      res.render('rooms/index', {
        title: 'Rooms tagged ' + req.param('tag'),
        rooms: rooms,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      })
    })
  })
}
