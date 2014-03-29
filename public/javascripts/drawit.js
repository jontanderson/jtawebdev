$(document).ready(function() {
	var socket = io.connect();
	var $message = $("#message");
	var $chatwindow = $("#chatwindow");
	var $userlist = $("#userlist");
	var $pad = $("#pad");
	var ctx = $pad[0].getContext('2d');
	var drawpad = document.getElementById('pad');
	var lastpos = Object();
	var lastemit = $.now();

	// set up stroke styling
	ctx.lineCap = 'round';
	ctx.lineWidth = 5;

	$("#sendmessageform").submit(function(e) {
		e.preventDefault();
		var data = { 
						username : socket.username,
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
				$("#mainwrapper").fadeIn();
			} else {
				alert("That username is already in use.  Please choose another.");				
			}
			$("#username").val('');
			$("#room").val('');
		});
	});
	
	var drawLine = function(x1,y1,x2,y2) {
		ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
	};

	$pad.on('mousedown',function(e) {
		e.preventDefault();
		if (!lastpos.drawing) {
			//rect = drawpad.getBoundingClientRect();
			lastpos.x = (e.pageX/$pad.width())*1000;
			lastpos.y = (e.pageY/$pad.height())*1000;
			//alert(e.clientX/$("#mainpanel").width()*rect.width);
		}
		lastpos.drawing = true;
	});

	$pad.on('mousemove',function(e) {
		if (lastpos) {
			if(($.now() - lastemit > 30) && (lastpos.drawing)) {
				//rect = drawpad.getBoundingClientRect();
				posx = (e.pageX/$pad.width())*1000;
				posy = (e.pageY/$pad.height())*1000;
				drawLine(lastpos.x,lastpos.y,posx,posy);
	            socket.emit('mousemove',{ x1: lastpos.x, y1: lastpos.y,x2: posx, y2: posy });
	            lastemit = $.now();
	        }			
		}
	});

	$pad.on('mouseup mouseleave',function() {
		lastpos.drawing = false;
	});

	socket.on('drawing',function(data) {
		// check if set
		if (lastpos.x) {
			$("body").append("(" + data.x1 + "," + data.y1 + ") - (" + data.x2 + "," + data.y2 + ")");
			// draw line from last position
			drawLine(data.x1, data.y1, data.x2, data.y2);
		}
		// update last position
		lastpos.x = data.x2;
		lastpos.y = data.y2;
	});

	socket.on('usernames',function(usernames) {
		$userlist.empty();
		for (i=0;i<usernames.length;i++) {
			$userlist.append("<li class='user'>" + usernames[i] + "</li>");			
		}
	});
	
	socket.on('userjoined',function(username) {
		$chatwindow.prepend("<li class='message'><span class='user'>" + username + "</span> joined the game.");
	});

	socket.on('userleft',function(username) {
		$chatwindow.prepend("<li class='message'><span class='user'>" + username + "</span> left the game.");
	});

	socket.on('newmessage',function(data) {
		$chatwindow.prepend("<li class='message'><span class='user'>" + data['username'] + "</span>: " + data['message'] + "</li>");
	});
});