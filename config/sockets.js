
/**
 * Module dependencies.
 */

/**
module.exports = function (app, passport) {
  var server = require('http').createServer(app),
      io = require('socket.io').listen(server);

  // Welcome Message to new clients
  messagesArray = [{ 'message':'Time to talk about X.title!' }];

  io.sockets.on('connection', function (socket) {
      
      // Send to current request socket client (c.f. faq)
      // E.g. Send welcome Message to new client
      socket.emit('pushdata', messagesArray);
      
      // INPUT
      socket.on('input', function (data) {

          // Append data to collection of messages
          messagesArray.push(data);

          // sending to all clients, include sender
          // Push collection of all messages to all clients
          io.sockets.emit('pushdata', messagesArray);
      });
      
      // DISCONNECT
      socket.on('disconnect', function () {
          io.sockets.emit('user disconnected');
      });
    
  });

  // Add more socket.io conficuration settings here.

  // development env config
  app.configure('development', function () {
    // TODO
  })
}
*/


var connect = require('connect')
  , parseCookie = connect.utils.parseCookie
  , mongoose = require('mongoose')
  , User = mongoose.model('User')
  , users = require('../app/controllers/users')


module.exports = function (app, passport, io) {
  // var io = require('socket.io').listen(server);
  var clients = {};
  var socketsOfClients = {};

/** Experimental configuration for authorization
 * 
  // io.configure(function (){
  //   io.set('authorization', function (data, callback) {

  //     console.log(connect.utils);
  //     // findDatabyip is an async example function
  //     // findDatabyIP(handshakeData.address.address, function (err, data) {
  //     //   if (err) return callback(err);

  //     //   if (data.authorized) {
  //     //     handshakeData.foo = 'bar';
  //     //     for(var prop in data) handshakeData[prop] = data[prop];
  //     //     callback(null, true);
  //     //   } else {
  //     //     callback(null, false);
  //     //   }
  //     // }) 
  //     // 
  //     console.log(data.headers.cookie);
  //     if (!data.headers.cookie) 
  //       return accept('No cookie transmitted.', false);

  //     data.cookie = parseCookie(data.headers.cookie);
  //     data.sessionID = data.cookie['express.sid'];

  //     store.load(data.sessionID, function (err, session) {
  //       if (err || !session) return accept('Error', false);

  //       data.session = session;
  //       return accept(null, true);
  //     });
  //   });
  // });
*/

  /**
   * Establishes a connection with the current client
   * eg. the client using the browser.  A chatter.
   **/
  io.sockets.on('connection', function(socket) {

    // Performed by controller (rooms.js)
    // 
    // /* 
    //  * Triggered by socket.emit('set username')
    //  */
    // socket.on('set username', function(userName) {
    //   // Is this an existing user name?
    //   if (clients[userName] === undefined) {
    //     // Does not exist ... so, proceed
    //     clients[userName] = socket.id;
    //     socketsOfClients[socket.id] = userName;
    //     userNameAvailable(socket.id, userName);
    //     userJoined(userName);
    //   } else
    //   if (clients[userName] === socket.id) {
    //     // Ignore for now
    //   } else {
    //     userNameAlreadyInUse(socket.id, userName);
    //   }
    // });

    /* 
     * Triggered by socket.emit('message')
     */
    socket.on('message', function(msg) {
      console.log('message!!!');
      console.log(msg);
      io.sockets.emit('message',
        {"source": srcUser,
         "message": msg.message,
         "target": "All"}); // TODO: Remove target, or build out private messages
      
      // var srcUser;
      // if (msg.inferSrcUser) {
      //   // Infer user name based on the socket id
      //   srcUser = socketsOfClients[socket.id];
      // } else {
      //   srcUser = msg.source;
      // }
   
      // // console.log(clients);
      // // console.log(msg.target);
      
      // // validation (TODO: Create / Move)
      // if(isEmpty(clients)) throw "VALIDATOR: Missing clients";
      // if(!msg.target) throw "VALIDATOR: Missing msg.target";

      // if (msg.target == "All") {
      //   // broadcast
      //   io.sockets.emit('message',
      //       {"source": srcUser,
      //        "message": msg.message,
      //        "target": msg.target});
      // } else {
      //   // Look up the socket id
      //   io.sockets.sockets[clients[msg.target]].emit('message',
      //       {"source": srcUser,
      //        "message": msg.message,
      //        "target": msg.target});
      // }
    })


    /* 
     * Triggered by socket.emit('disconnect')
     */
    socket.on('disconnect', function() {
      var uName = socketsOfClients[socket.id];
      delete socketsOfClients[socket.id];
      delete clients[uName];
   
      // ??? This relay this message to all the clients
      // However, a user hasn't "left" the chat
      // userLeft(uName);
    })
  })
   

  /**
   * Emit the userJoined event to all involved
   **/
  function userJoined(uName) {
      Object.keys(socketsOfClients).forEach(function(sId) {
        io.sockets.sockets[sId].emit('userJoined', { "userName": uName });
      })
  }
   
  function userLeft(uName) {
      io.sockets.emit('userLeft', { "userName": uName });
  }
   
  function userNameAvailable(sId, uName) {
    setTimeout(function() {
      io.sockets.sockets[sId].emit('welcome', { "userName" : uName, "currentUsers": JSON.stringify(Object.keys(clients)) });
    }, 500);
  }
   
  function userNameAlreadyInUse(sId, uName) {
    setTimeout(function() {
      io.sockets.sockets[sId].emit('error', { "userNameInUse" : true });
    }, 500);
  }

  /**
   * Helper functions!
   **/ 
  function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
  }

}

