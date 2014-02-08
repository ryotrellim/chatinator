
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  console.log('requiresLogin (in authorization.js)');
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
  next()
}

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization : function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/users/'+req.profile.id)
    }
    next()
  }
}

/*
 *  Article authorization routing middleware
 */

exports.room = {
  hasAuthorization : function (req, res, next) {
    if (req.room.user.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/rooms/'+req.room.id)
    }
    next()
  }
}
