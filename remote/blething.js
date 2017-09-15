 
//var nobleDevice = require('noble-device');

var remble = require('./remble');
remble.consoleHello('world');


// MODIFY THIS WITH THE APPROPRIATE URL
var socket = require('socket.io-client')('http://localhost:8080');


process.on("SIGINT", function(){
    
  console.log("SIGINT - Exiting ...");
  process.exit();
});


socket.on("connection", function() {
    console.log("[connection] Connected to socket.io server");
});
socket.on("connect", function() {
    console.log("[connect] Connected to socket.io server");
});

  
socket.on("updateState", function(state){
    console.log("The new state is: " + state);
    if(!state)
        console.log("LED OFF");
    else
        console.log("LED ON");
    //gpio.write(config.led, !state);
});
  

//--------------------------------------------------  
//https://www.jaredwolff.com/blog/raspberry-pi-getting-interactive-with-your-server-using-websockets/
socket.on('example-ping', function(data) {
    console.log("ping");
    
    delay = data["duration"];
    // Set a timer for when we should stop watering
    setTimeout(function(){
      socket.emit("example-pong", "This is data from Raspberry Pi");
    }, delay*1000);
});
//--------------------------------------------------  

  
socket.on('fromW-ping', function(data){
		console.log('server recv: fromW-ping');
		console.log('  data = ' + data);
		console.log('server send: toC-ping');
    	io.sockets.emit('toC-ping',{ duration: 2 });
});
  
socket.on('fromC-pong', function(data){
		console.log('server recv: fromC-pong');
		console.log('  data = ' + data);
		console.log('server send: toW-pong');
		var _msg = data;
		data = { user :'client', msg : _msg};
    	io.sockets.emit('toW-pong', data);
});




socket.on('connectToRem:rem', function(data) {
    var id = data.id;
    console.log('connectToRem:rem id = ' + id);    
});
  
socket.on('pktToRem:rem', function(data) {
    var pkt = data.pkt;    
    console.log('pktToRem:rem pkt = ' + pkt);
    //io.emit('pktTosvr:rem', pkt);
});
  



// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
remble.connectioStatusCallback = function(idAndStatus) {
    console.log('connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
    socket.emit('connectionStatus', idAndStatus);
};

socket.on('doConnect', function(id) {
    remble.doDiscover_ConnectAndSetup(id, connectioStatusCallback);
});

socket.on('doDisconnect', function(id) {
    remble.doDisconnect(id, connectioStatusCallback);
});

// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
remble.doSendpkt = function(idAndPkt) { //, callback) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;
    remble.doSend(id, pkt, function(idAndStatus){
        console.log('doSend (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
        //callback(idAndStatus);
    });
}

socket.on('doSend', remble.doSendpkt);

// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
remble.onRecvPkt = function(idAndPkt) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;

    console.log('onRecvPkt (id = ' + idAndStatus.id + ') pkt.len = ' + idAndStatus.pkt.length);

}

//NG remble.on('pktUp',remble.onRecvPkt);

// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST

//RUN 
//remble.idOrLocalName = 'ec7c1580b564';


var id = 'ec7c1580b564';

remble.print_bleid();

remble.doDiscover_ConnectAndSetup(id, function(idAndStatus) {
    console.log('connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
    
    var status = idAndStatus.status;
    if(status)
    {
        var _pkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94];
        var idAndPkt = { id : remble.idOrLocalName, pkt : _pkt };
        //remble.doSendpkt (idAndPkt, onRecvPkt);
        remble.doSendpkt (idAndPkt);
    }

});

