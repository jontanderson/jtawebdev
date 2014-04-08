var Phrases = require('../db/db.js');

// configuring socket.io
exports.configure = function(server)
{
	// setup Socket.IO
	var io = require('socket.io').listen(server);
	var users = [];
	var curdrawer;

	// configure heartbeat
	io.set('heartbeat timeout',10);
	io.set('heartbeat interval',4);

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
				socket.isDrawing = false;
				if (!users) {
					users = new Array();
					// if first user, automatically chosen to draw
					curdrawer = data['username'];
					socket.emit('userchosentodraw');
				}
				users.push(data['username']);
				io.sockets.emit('usernames',{ users: users, drawer: curdrawer });
				io.sockets.emit('userjoined',data['username']);
			}
		});
		
		// drawing
		socket.on('mousemove',function(data) {
			socket.broadcast.emit('drawing',data);
		});

		// user leaves the room
		socket.on('disconnect',function() {
			if (!socket.username) return;
			users.splice(users.indexOf(socket.username),1);
			io.sockets.emit('usernames',users);
			io.sockets.emit('userleft',socket.username);
			if (users.length > 0)
			io.sockets.emit('userchosentodraw')
		});

		// user chose a category
		socket.on('categorychosen',function(category) {
			Phrases.getPhrase(category,function(err,phrase) {
				if (err) {
					console.log(err);
					return;
				}
				socket.broadcast.emit('newcategory',phrase.category);
				socket.emit('newphrase',phrase);
			});
		});

		socket.on('starttimer',function() {
			var i = 0;
			var startup = [ 'READY', 'SET', 'GO!' ];
			var prepareID = setInterval(function() {
				io.sockets.emit('playgame',startup[i]);
				if (++i == 3) {
					clearInterval(prepareID);
					var time = 30;
					var timeout = new Date();
					var timeleft;
					var now;
					timeout = new Date();
					timeout = (timeout.getTime() + time*1000);
					io.sockets.emit('playgame');
					now = new Date();
					timeleft = timeout-(new Date()).getTime();
					io.sockets.emit('timerupdate',padTime(timeleft/1000));
					var intervalID = setInterval(function () {
						now = new Date();
						timeleft = timeout-(new Date()).getTime();
						io.sockets.emit('timerupdate',padTime(timeleft/1000));
		   				if (timeleft <= 0) {
		       				clearInterval(intervalID);
		       				io.sockets.emit('timeup');
		   				}
					}, 1000);
				}
			},1000);
		});

		socket.on('resetdrawing',function() {
			io.sockets.emit('cleardrawing');
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