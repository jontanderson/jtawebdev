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
	});
};

// routes
exports.index = function(req, res){
  res.render('drawit/index', { title: 'DrawIt!',categories: Phrases.getCategories() });
};