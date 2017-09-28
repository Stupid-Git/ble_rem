var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

//var Buffer = require('buffer');
//console.log(Buffer);

server.listen(process.env.PORT || 8088);

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


	//test=============================================================================
	//test=============================================================================

//====================================================================
// SCAN BLUETOOTH LE
//====================================================================
var SCANSTART_WEB        = 'scanStart:web';         // Down
var SCANSTOP_WEB         = 'scanStop:web';          // Down
var SCANDATA_WEB         = 'scanData:web';          // Up
var SCANSTARTED_WEB      = 'scanStarted:web';       // Up
var SCANSTOPPED_WEB      = 'scanStopped:web';       // Up

var SCANSTART_REM        = 'scanStart:rem';         // Down
var SCANSTOP_REM         = 'scanStop:rem';          // Down
var SCANDATA_REM         = 'scanData:rem';          // Up
var SCANSTARTED_REM      = 'scanStarted:rem';       // Up
var SCANSTOPPED_REM      = 'scanStopped:rem';       // Up


// message passing ----------------------------------------------------
socket.on(SCANSTART_WEB, function(data){		// Down
	io.emit(SCANSTART_REM, data);
})
socket.on(SCANSTOP_WEB, function(data){		// Down
	io.emit(SCANSTOP_REM, data);
})
socket.on(SCANDATA_REM, function(data){		// Up
	console.log('on - SCANDATA_WEB data = ' + data);
	io.emit(SCANDATA_WEB, data);
})
socket.on(SCANSTOPPED_REM, function(data){	// Up
	io.emit(SCANSTOPPED_WEB, data);
})


var CONNECT_REM          = 'connect:rem';           // Down
var DISCONNECT_REM       = 'disconnect:rem';        // Down
var CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up

var CONNECT_WEB          = 'connect:web';           // Down
var DISCONNECT_WEB       = 'disconnect:web';        // Down
var CONNECTIONSTATUS_WEB = 'connectionStatus:web';  // Up


var DNPKT_REM            = 'dnPkt:rem';             // Down
var DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
var UPPKT_REM            = 'upPkt:rem';             // Up

var DNPKT_WEB            = 'dnPkt:web';             // Down
var DNPKTSENTCFM_WEB     = 'dnPktSentCfm:web';      // Up
var UPPKT_WEB            = 'upPkt:web';             // Up

	// message passing ----------------------------------------------------


	socket.on(CONNECT_WEB, function(data){			// Down
		console.log('on - CONNECT_WEB data = ' + data);
		io.emit(CONNECT_REM, data);
	})
	socket.on(DISCONNECT_WEB, function(data){			// Down
		console.log('on - DISCONNECT_WEB');
		io.emit(DISCONNECT_REM, data);
	})
	socket.on(CONNECTIONSTATUS_REM, function(data){	// Up
		var text = 'Unknown';
		if(data.status === true) text = 'Connected';
		if(data.status === false) text = 'Disconnected';
		console.log('on - CONNECTIONSTATUS_REM ' + text);
		io.emit(CONNECTIONSTATUS_WEB, data);
	})


	socket.on(DNPKT_WEB, function(data){			// Down
		console.log('on - DNPKT_WEB');
		io.emit(DNPKT_REM, data);
		//io.sockets.emit(DNPKT_REM, data);
	})
	socket.on(DNPKTSENTCFM_REM, function(data_is_id){	// Up
		console.log('on - DNPKTSENTCFM_REM');
		io.emit(DNPKTSENTCFM_WEB, data_is_id);
	})
	socket.on(UPPKT_REM, function(data){			// Up
		console.log('on - UPPKT_REM');
		io.emit(UPPKT_WEB, data);
	})



/*
	var id = 'ec7c1580b564';

	socket.on(CONNECTIONSTATUS_REM, function(idAndStatus) {
	    console.log('### connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);

	    var status = idAndStatus.status;
	    if(status)
	    {
	        console.log('### BLE Connected');

	        socket.on(DNPKTSENTCFM_REM , function(id){
	            console.log('### Remote confirmed DnPktSent');
	        });

	        socket.on(UPPKT_REM, function(idAndPkt) {
	           console.log('### Remote sent us an UnPktSent');
	           socket.emit(DISCONNECT_REM, id);
	        });

	        var _pkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94];
	        var idAndPkt = { id : id, pkt : _pkt };

	        socket.emit(DNPKT_REM , idAndPkt);
	        console.log(DNPKT_REM + ' Sent to Remote');
	    } else {
	        console.log('### BLE Disconnected');
	    }

	});


	//RUN
	socket.emit(CONNECT_REM, id);
	console.log('### CONNECT_REM  Sent to Remote');
*/
	//test=============================================================================
	//test=============================================================================


});
