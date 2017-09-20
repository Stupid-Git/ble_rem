 
//var nobleDevice = require('noble-device');

var remble = require('./remble');
remble.consoleHello('world');


// MODIFY THIS WITH THE APPROPRIATE URL
var socket = require('socket.io-client')('http://localhost:8080');


process.on("SIGINT", function(){
    
  console.log("SIGINT - Exiting ...");
  process.exit();
});


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//  Example Stuff (Start)
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

//--------------------------------------------------
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
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//  Example Stuff (End)
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------





var STARTSCAN_REM        = 'startScan:rem';         // Down
var STOPSCAN_REM         = 'stopScan:rem';          // Down
var SCANDATA_REM         = 'scanData:rem';          // Up
var SCANSTOPPED_REM      = 'scanStoppped:rem';      // Up

var CONNECT_REM          = 'connect:rem';           // Down
var DISCONNECT_REM       = 'disconnect:rem';        // Down
var DISCONNECTED_DEV     = 'disconnected:dev';      // Up (from noble ...)
var CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up

var DNPKT_REM            = 'dnPkt:rem';             // Down
var DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
var UPPKT_REM            = 'upPkt:rem';             // Up

// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN

remble.onDNPKT_REM = function(idAndPkt) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;
    console.log('onDNPKT_REM (id = ' + id + ') pkt.len = ' + pkt.length);
    //var _pkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94];
    //var idAndPkt = { id : remble.idOrLocalName, pkt : _pkt };

    remble.doSend(id, pkt, function(idAndStatus){
        console.log('doSend (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
        //callback(idAndStatus);
    });
}


// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP

// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
//remble.
connectionStatusCallback = function(idAndStatus) {
    console.log('');
    console.log('');
    console.log('### connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);

    socket.emit(CONNECTIONSTATUS_REM, idAndStatus);
    
    if(idAndStatus.status === true) { // connectied

        // Configure packet Up from device to be sent to Web
        device = get_activePeripheral();

        device.on(DISCONNECTED_DEV, function(xxx) {
            _idAndStatus = { id : idAndStatus.id, status : false };
            connectionStatusCallback(_idAndStatus);
        });


        device.on(UPPKTRDY_DEV, function(idAndPkt) {
            socket.emit(UPPKT_REM, idAndPkt);
            var id = idAndPkt.id;
            var pkt = idAndPkt.pkt;
            console.log('### UPPKTRDY_DEV (id = ' + id + ') pkt.len = ' + pkt.length);
        });

        socket.on(DNPKT_REM, remble.onDNPKT_REM );

    } else { // disconnected

        socket.removeListener(DNPKT_REM, remble.onDNPKT_REM );
    }
};


socket.on(CONNECT_REM, function(id) {
    console.log("[CONNECT_REM] ...");
    remble.doDiscover_ConnectAndSetup(id, connectionStatusCallback);
});

socket.on(DISCONNECT_REM, function(id) {
    console.log("[DISCONNECT_REM] ...");
    remble.doDisconnect(id, function(null_data) {
        console.log('doDisconnect CALLBACK DATA = ' + null_data);
    });
});



// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
/*
var id = 'ec7c1580b564';

socket.on(CONNECTIONSTATUS_REM, function(idAndStatus) {
    console.log('connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);

    var status = idAndStatus.status;
    if(status)
    {
        socket.on(DNPKTSENTCFM_REM , function(X){
            console.log('Remote confirmed DnPktSent');
        });

        socket.on(UPPKT_REM, function(idAndPkt) {
           console.log('Remote sent us an UnPktSent'); 
           socket.emit(CONNECT_REM, id);
        });

        var _pkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94];
        var idAndPkt = { id : id, pkt : _pkt };

        socket.emit(DNPKT_REM , idAndPkt);
    }

});

//RUN
//socket.emit(CONNECT_REM, id);

// server side socket.on("connection", function() {
// server side     console.log("[connection] Connected to socket.io server");
// server side });

socket.on("connect", function() {
    console.log("[connect] Connected to socket.io server");
    var _id = 'ec7c1580b564';
    socket.emit(CONNECT_REM, _id);    
});
*/




/*
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
//remble.onUpPktRdy = function(idAndPkt) {
onUpPktRdy = function(idAndPkt) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;

    device = get_activePeripheral();;

    socket.emit('', idAndPkt);

    console.log('    onUpPktRdy (id = ' + id + ') pkt.len = ' + pkt.length);

}



var id = 'ec7c1580b564';

remble.print_bleid();

remble.doDiscover_ConnectAndSetup(id, function(idAndStatus) {

    device = get_activePeripheral();
    //device.on('upPktRdy:dev',remble.onUpPktRdy);
    device.on('upPktRdy:dev',onUpPktRdy);

    console.log('connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
    
    var status = idAndStatus.status;
    if(status)
    {
        var _pkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94];
        var idAndPkt = { id : remble.idOrLocalName, pkt : _pkt };
        //remble.doSendpkt (idAndPkt, onUpPktRdy);
        remble.doSendpkt (idAndPkt);
    }

});
*/

