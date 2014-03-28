exports.configure = function(server)
{
	// setup Socket.IO
	var io = require('socket.io').listen(server);
	
	// listen for connection
	io.sockets.on('connection', function(socket) {
		// listen for sent messages and process them
		socket.on('sendmessage',function(data) {
			io.sockets.emit('newmessage',data);
		});		
	});
};


exports.index = function(req, res){
  res.render('drawit/index', { title: 'DrawIt!' });
};