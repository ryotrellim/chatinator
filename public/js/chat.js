var socket;
var myUserName;
 
socket = io.connect("http://localhost:3000");

function enableMsgInput(enable) {
  $('input#msg').prop('disabled', !enable);
}
 
function enableUsernameField(enable) {
  $('input#userName').prop('disabled', !enable);
}
 
function appendNewMessage(msg) {
  var html;
  if (msg.target == "All") {
    html = "<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br/>"
  } else {
    // It is a private message to me
    html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>"
  }
  $('#msgWindow').append(html);
}
 
function appendNewUser(uName, notify) {
  console.log('appendNewUser');
  $('select#users').append($('<option></option>').val(uName).html(uName));
  if (notify && (myUserName !== uName) && (myUserName !== 'All'))
    $('span#msgWindow').append("<span class='adminMsg'>==>" + uName + " just joined <==<br/>")
}
 
function handleUserLeft(msg) {
    $("select#users option[value='" + msg.userName + "']").remove();
}

function setFeedback(fb) {
  $('span#feedback').html(fb);
}

/** Remove: will be authorized on message sent **/
function setUsername() {
    myUserName = $('input#userName').val();
    console.log('setUserName()');
    socket.emit('set username', $('input#userName').val(), function(data) { console.log('emit set username', data); });
    console.log('Set user name as ' + $('input#userName').val());
}
 
function sendMessage(trgtUser) {
    socket.emit('message', 
                {
                  "inferSrcUser": true,
                  "source": "",
                  "message": $('input#msg').val(),
                  "target": trgtUser
                });
    $('input#msg').val("");
}
 
function setCurrentUsers(usersStr) {
    console.log('setCurrentUsers()');
    console.log(usersStr);

    $('select#users >option').remove()
    appendNewUser('All', false)
    JSON.parse(usersStr).forEach(function(name) {
        appendNewUser(name, false);
    });
    $('select#users').val('All').attr('selected', true);
}
 
$(function() {
  enableMsgInput(false);

  socket.on('userJoined', function(msg) {
    appendNewUser(msg.userName, true);
  });
   
  socket.on('userLeft', function(msg) {
    handleUserLeft(msg);
  });
 
  socket.on('message', function(msg) {
    appendNewMessage(msg);
  });
 
  socket.on('welcome', function(msg) {
    console.log('msg is...');
    console.log(msg);
    setFeedback("<span style='color: green'> Connected to room.</span>");
    setCurrentUsers(msg.currentUsers)
    enableMsgInput(true);
    enableUsernameField(false);
  });
 
  socket.on('error', function(msg) {
      if (msg.userNameInUse) {
          setFeedback("<span style='color: red'> Username already in use. Try another name.</span>");
      }
  });
  

  $('input#userName').change(setUsername);
  $('input#userName').keypress(function(e) {
      if (e.keyCode == 13) {
          setUsername();
          // e.stopPropagation();
          // e.stopped = true;
          // e.preventDefault();
      }
  });
   
  $('input#msg').keypress(function(e) {
      trgtUser = $('select#users').val();
      var trgtUser = $('select#users').val();
      if (e.keyCode == 13) {
          sendMessage(trgtUser);
          e.stopPropagation();
          e.stopped = true;
          e.preventDefault();
      }
  });
});