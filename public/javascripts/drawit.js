$(document).ready(function() {
	var socket = io.connect();
	var $message = $("#message");
	var $chatwindow = $("#chatlist");
	var $userlist = $("#userlist");
	var $pad = $("#pad");
	var $timer = $("#timer");
	var ctx = $pad[0].getContext('2d');
	var drawpad = document.getElementById('pad');
	var lastpos = Object();
	var lastemit = $.now();

	// set up stroke styling
	ctx.lineCap = 'round';
	ctx.lineWidth = 5;

	$("#categoryselect").on('change',function(e) {
		socket.emit('categorychosen',$("#categoryselect").find(":selected").attr('value'));
	});

	$("#pickagain").on('click',function(e) {
		socket.emit('categorychosen',$("#categoryselect").find(":selected").attr('value'));
	});

	$("#starttime").on('click',function(e) {
		$("#phrasewindow").hide();
		$("#drawphrase").fadeIn(200);
		socket.emit('starttimer');
	});

	$("#clearbutton").on('click',function(e) {
		socket.emit('resetdrawing');
	});

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
					};
		socket.emit('newuser', data,function(valid) {
			if (valid) {
				$("#loginwrapper").hide();
				$("#mainwrapper").fadeIn();
			} else {
				alert("That username is already in use.  Please choose another.");				
			}
			$("#username").val('');
		});
	});
	
	var drawLine = function(x1,y1,x2,y2) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
	};

	socket.on('userchosentodraw',function() {
		$("#nodraw").hide();
		$("#padcover").hide();
		$("#phrasewindow").fadeIn(1000);
	});

	$pad.on('touchstart',function(e) {
		e.pageX = e.originalTarget.touchTargets[0].pageX;
		e.pageY = e.originalTarget.touchTargets[0].pageY;
		drawstart(e);
	});

	$pad.on('mousedown',function(e) {
		e.preventDefault();
		drawstart(e);
	});

	$pad.on('touchmove',function(e) {
		e.pageX = e.originalTarget.touchTargets[0].pageX;
		e.pageY = e.originalTarget.touchTargets[0].pageY;
		drawing(e);			
	});

	$pad.on('mousemove',function(e) {
		drawing(e);
	});

	$pad.on('mouseup mouseleave touchend',function() {
		lastpos.drawing = false;
	});

	socket.on('drawing',function(data) {
		// check if set
		if (lastpos.x) {
			// draw line from last position
			drawLine(data.x1, data.y1, data.x2, data.y2);
		}
		// update last position
		lastpos.x = data.x2;
		lastpos.y = data.y2;
	});

	socket.on('cleardrawing',function() {
		ctx.clearRect(0,0,1000,1000);
	});

	socket.on('usernames',function(users) {
		$userlist.empty();
		for (i=0;i<users.users.length;i++) {
			if (users.drawer == users.users[i]) {
				// set the class for this list item differently
				// since the person is the drawer
				drawerclass = "drawerclass";
			} else {
				drawerclass = "";
			}
			$userlist.append("<li class='user " + drawerclass + "'>" + users.users[i] + "</li>");			
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

	socket.on('newgame',function(user) {
		$("#nodraw").show();
		$("#padcover").hide();
		$("#drawphrase").hide();
		$("#clearbutton").hide();
		$("#phrasepreview").hide();
		$("#choosephrase").hide();
		if(user == socket.username) {
			// current drawer
			$("#choosecategory").fadeIn(500);
			$("#nodraw").hide();
		}
	});

	socket.on('newphrase',function(data) {
		$("#choosecategory").find("p").fadeOut(500,function() {
			$("#categoryselect").fadeIn(500);
			$("#phrasepreview").html(data.phrase.toUpperCase());
			$("#phrase").html(data.phrase.toUpperCase());
			$("#choosephrase").fadeIn(500);
		});
	});

	socket.on('newcategory',function(category) {
		$("#drawphrase").show();
		$("#category").html("The current category is: " + category.toUpperCase());
	});

	var drawstart = function(event) {
		if (!lastpos.drawing) {
			lastpos.x = (event.pageX/$pad.width())*1000;
			lastpos.y = (event.pageY/$pad.height())*1000;
		}
		lastpos.drawing = true;		
	};

	var drawing = function(event) {
		if (lastpos) {
			if(($.now() - lastemit > 30) && (lastpos.drawing)) {
				posx = (event.pageX/$pad.width())*1000;
				posy = (event.pageY/$pad.height())*1000;
				drawLine(lastpos.x,lastpos.y,posx,posy);
	            socket.emit('mousemove',{ x1: lastpos.x, y1: lastpos.y,x2: posx, y2: posy });
	            lastpos.x = posx;
	            lastpos.y = posy;
	            lastemit = $.now();
	        }			
		}
	};

	socket.on('playgame',function(preparestring) {
		$("#drawphrase").show();
		$timer.html(preparestring).show();
		setTimeout(function() {
			$timer.fadeOut(400);
		},500);
	});

	socket.on('timerupdate',function(newtime) {
		$("#clearbutton").show();
		$timer.show().html(newtime);
	});

	socket.on('timeup',function() {
		$timer.css("{ color: #faa; }");
		$("#padcover").show();
	});
});