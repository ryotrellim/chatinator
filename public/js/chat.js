var socket;
var myUserName;
 
socket = io.connect();

function enableJoinRoom(enable) {
  $('button#joinRoom').prop('disabled', !enable);
}
 
function enableLeaveRoom(enable) {
  $('button#leaveRoom').prop('disabled', !enable);
}
 
function appendNewMessage(msg) {
  var html = "<span class='allMsg'>" + msg.userName + " : " + msg.message.body + "</span><br/>";
  // if (msg.target == "All") {
  //   html = "<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br/>"
  // } else {
  //   // It is a private message to me
  //   html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>"
  // }
  $('#msgWindow').append(html);
}
 
function handleUserJoined(userName, notify) {
  // console.log('handleUserJoined');
  $('ul#participantList').append($('<li></li>').val(userName).html(userName));
  
  if(myUserName = userName) {
    $('span#msgWindow').append("<span class='adminMsg'>Welcome to Chatinator!<br/>");
  }
  if (notify && (myUserName !== userName) && (myUserName !== 'All'))
    $('span#msgWindow').append("<span class='adminMsg'>==>" + userName + " just joined <==<br/>")
}
 
function handleUserLeft(msg) {
    $("ul#participantList li:contains('"+msg.userName+"')").remove();
}

function setFeedback(fb) {
  $('span#feedback').html(fb);
}

/** Remove: will be authorized on message sent **/
// function setUsername() {
//     myUserName = $('input#userName').val();
//     console.log('setUserName()');
//     socket.emit('set username', $('input#userName').val(), function(data) { console.log('emit set username', data); });
//     console.log('Set user name as ' + $('input#userName').val());
// }
 

 
// Initial population should be done automatically now by the view renderer (jade)
// function setCurrentUsers(usersStr) {
//     console.log('setCurrentUsers()');
//     console.log(usersStr);
//     $('select#users >option').remove()
//     handleUserJoined('All', false)
//     JSON.parse(usersStr).forEach(function(name) {
//         handleUserJoined(name, false);
//     });
//     $('select#users').val('All').attr('selected', true);
// }

function setCSRFToken() {
  var CSRF_HEADER = 'X-CSRF-Token';
  var csrf_token = $('meta[name="csrf-token"]').attr('content');
  jQuery.ajaxPrefilter(function(options, _, xhr) {
    if ( !xhr.crossDomain ) 
        xhr.setRequestHeader(CSRF_HEADER, csrf_token);
  });
};

function sendMessage(trgtUser, message) {
  var href = window.location.href;
  var roomId = href.split("/").reverse();
  var message = {
    "target": trgtUser,
    "body": $('textarea#msg').val()
  }
  var data = JSON.stringify(message);
  if(roomId[1] == 'rooms') { 
    setCSRFToken();
    $.post('/rooms/'+roomId[0]+'/message', message, function(data){
      $('textarea#msg').val(""); // empty the chat box
      // TODO: Bling for joining a room
    });
  }
  // socket.emit('message', 
  //             {
  //               "inferSrcUser": true,
  //               "source": "",
  //               "message": $('input#msg').val(),
  //               "target": trgtUser
  //             });
  // $('input#msg').val("");
}

function joinRoom() {
  // $.post('/users/session', function(data) {
  //   console.log(data);
  //   // setCurrentUsers(data.userName);
  // });
  var href = window.location.href;
  var roomId = href.split("/").reverse();
  if(roomId[1] == 'rooms') { 
    setCSRFToken();
    $.post('/rooms/'+roomId[0]+'/join', function(data){
      // TODO: Bling for joining a room
      enableJoinRoom(false);
      enableLeaveRoom(true);
    });
  }
}



function leaveRoom() {
  var href = window.location.href;
  var roomId = href.split("/").reverse();
  if(roomId[1] == 'rooms') {
    setCSRFToken();
    $.post('/rooms/'+roomId[0]+'/leave', function(data){
      // TODO: Bling for leaving a room
      enableJoinRoom(true);
      enableLeaveRoom(false);
    });
  }
}

 
$(function() {

  // enableMsgInput(false);

  // TODO: Tie both of these to interface items.
  // joinRoom()
  // leaveRoom()
  $('#joinRoom').click(joinRoom);
  $('#leaveRoom').click(leaveRoom);

  socket.on('userJoined', function(msg) {
    handleUserJoined(msg.userName, true);
  });
   
  socket.on('userLeft', function(msg) {
    handleUserLeft(msg);
  });
 
  socket.on('message', function(msg) {
    console.log('socket.on(message)...Deliverying yo message!');
    console.log(msg);
    appendNewMessage(msg);
  });
 
  socket.on('welcome', function(msg) {
    setFeedback("<span style='color: green'> Connected to room.</span>");
    setCurrentUsers(msg.currentUsers)
    // enableMsgInput(true);
    // enableUsernameField(false);
  });
 
  socket.on('error', function(msg) {
      if (msg.userNameInUse) {
          setFeedback("<span style='color: red'> Username already in use. Try another name.</span>");
      }
  });
  
  $('button#msgSubmit').click(function(e) {
    if($('textarea#msg').val() !== "") {
      sendMessage("All");
      e.stopPropagation();
      e.stopped = true;
      e.preventDefault();
    }
  });

  $('textarea#msg').keypress(function(e) {
      if (e.keyCode == 13) {
          if($('textarea#msg').val() !== "") {
            sendMessage("All");
            e.stopPropagation();
            e.stopped = true;
            e.preventDefault();
          }
      }
  });

});