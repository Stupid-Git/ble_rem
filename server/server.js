var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 8080);

console.log('Server running ...');

app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html')
});



io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data){
		
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected' + ' Goodbye ' + socket.username, connections.length);
	});

	// Send Message
	socket.on('send message', function(data) {
		console.log(data);
		io.sockets.emit('new message', {msg:data, user:socket.username});
	});

	// New User
	socket.on('new user', function(data, callback) {
		callback(true);
		console.log('Added User: ' + data);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}


	socket.on('connectBle:web', function( data) {
		var id = data.id;
		console.log('connectBle:web id = ' + id);
		io.emit('connectToRem:rem', data);
	});
	
	socket.on('sendPktBle:web', function( data) {
		var pkt = data.pkt;
		console.log('sendPktBle:web pkt = ' + pkt);
		io.emit('pktToRem:rem', data);

		io.emit('recvPktBle:web', data);
	});

});


