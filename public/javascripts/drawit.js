$(document).ready(function() {
	var socket = io.connect();
	var $message = $("#message");
	var $chatwindow = $("#chatwindow");
	var $userlist = $("#userlist");
	
	$("#sendmessageform").submit(function(e) {
		e.preventDefault();
		var data = { 
								 message : $message.val() 
							 };
		$message.val("");
		socket.emit('sendmessage',data);
	});
	
	$("#userform").submit(function(e) {
		e.preventDefault();
		var data = {
									username : $("#username").val(),
									room     : $("#room").val()
							 };
		socket.emit('newuser', data,function(valid) {
			if (valid) {
				$("#loginwrapper").hide();
				$("#mainwrapper").show();
			} else {
				alert("That username is already in use.  Please choose another.");				
			}
			$("#username").val('');
			$("#room").val('');
		});
	});
	
	socket.on('usernames',function(usernames) {
		$("#userlist").empty();
		for (i=0;i<usernames.length;i++) {
			$("#userlist").append("<li class='user'>" + usernames[i] + "</li>");			
		}
	});
	
	socket.on('userjoined',function(username) {
		$chatwindow.prepend("<li class='message'><span class='user'>" + username + "</span> joined the game.");
	});
	socket.on('newmessage',function(data) {
		$chatwindow.append("<li class='message'>" + data['message'] + "</li>");
	});
});