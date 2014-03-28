$(document).ready(function() {
	var socket = io.connect();
	var $message = $("#message");
	var $chatwindow = $("#chatwindow");
	
	$("#sendmessageform").submit(function(e) {
		e.preventDefault();
		var data = { 
								 message : $message.val() 
							 };
		$message.val("");
		socket.emit('sendmessage',data);
	});
	
	socket.on('newmessage',function(data) {
		alert(data['message']);
		$chatwindow.append("<li class='message'>" + data['message'] + "</li>");
	});
});