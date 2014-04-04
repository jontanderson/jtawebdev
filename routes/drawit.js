var Phrases = require('../db/db.js');

// configuring socket.io
exports.configure = function(server)
{
	// setup Socket.IO
	var io = require('socket.io').listen(server);
	var users = [];

	// listen for connection
	io.sockets.on('connection', function(socket) {
		
		// listen for sent messages and process them
		socket.on('sendmessage',function(data) {
			data.username = socket.username;
			io.sockets.in(socket.room).emit('newmessage',data);
		});
		
		// new user signed in
		socket.on('newuser',function(data,callback) {
			if (users.indexOf(data["username"]) != -1)
			{
				callback(false);
			} else {
				callback(true);
				socket.username = data['username'];
				socket.room = data['room'];
				socket.join(data['room']);
				if (!users[data['room']]) {
					users[data['room']] = new Array();
				}
				users[data['room']].push(data['username']);
				io.sockets.in(data['room']).emit('usernames',users[data['room']]);
				io.sockets.in(data['room']).emit('userjoined',data['username']);
			}
		});
		
		// drawing
		socket.on('mousemove',function(data) {
			io.sockets.in(socket.room).emit('drawing',data);
		});

		// user leaves the room
		socket.on('disconnect',function() {
			console.log(socket.username + " disconnected from room '" + socket.room + "'");
			if (!socket.username) return;
			users[socket.room].splice(users.indexOf(socket.username),1);
			io.sockets.in(socket.room).emit('usernames',users[socket.room]);
			io.sockets.in(socket.room).emit('userleft',socket.username);
		});

		// user chose a category
		socket.on('categorychosen',function(category) {
			Phrases.getPhrase(category,function(err,phrase) {
				if (err) {
					console.log(err);
					return;
				}
				console.log("New Phrase is " + phrase);
				socket.emit('newphrase',phrase);
			});
		});

		socket.on('starttimer',function() {
			console.log("Starting timer...");
			var time = 11;
			var timeout = new Date();
			console.log(timeout.getTime());
			var timeleft;
			var now;
			setTimeout(function() {
				timeout = new Date();
				timeout = (timeout.getTime() + time*1000);
				io.sockets.in(socket.room).emit('playgame');
				var intervalID = setInterval(function () {
					now = new Date();
					timeleft = timeout-(new Date()).getTime();
					io.sockets.in(socket.room).emit('timerupdate',padTime(timeleft/1000));
	   				if (timeleft <= 0) {
	       				clearInterval(intervalID);
	       				io.sockets.in(socket.room).emit('timeup');
	   				}
				}, 1000);
			},500);
		});
	});
};

var padTime = function(i) {
	if (i <= 0) {
		return "0:00";
	}
	result = (Math.floor(i/60)) + ":";
	if (i % 60 < 10) {
		result = result + "0";
	}
	return result + Math.floor(i%60);
}

// routes
exports.index = function(req, res){
  res.render('drawit/index', { title: 'DrawIt!',categories: Phrases.getCategories() });
};