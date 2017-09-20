

var async = require('async');

var NobleDevice = require('noble-device');


/*
var idOrLocalName = process.argv[2]; // ec7c1580b564 TR-45BLE-DBG-01
if (!idOrLocalName) {
  console.log("node mydev1.js [ID or local name]");
  process.exit(1);
}
*/

var Remble = function(device) {
  NobleDevice.call(this, device);
};

//Remble.prototype.idOrLocalName = 'aabbccddeeff';
//Remble.prototype.activePeripheral = null;

var rbstate = {};
//rbstate.peripheral = null;
rbstate.activePeripheral = null;
rbstate.idOrLocalName = 'aabbccddeeff';

get_activePeripheral = function()
{
	return(rbstate.activePeripheral);
}

// this is an override. return true if device id or localname matches what we defined
Remble.is = function(device) {
  var localName = device.advertisement.localName;
  console.log('Remble.is: DevId = ' + device.id + " LocalName = " + localName);
  return (device.id === rbstate.idOrLocalName || localName === rbstate.idOrLocalName);
  //return (device.id === idOrLocalName || localName === idOrLocalName);
};

NobleDevice.Util.inherits(Remble, NobleDevice);
NobleDevice.Util.mixin(Remble, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(Remble, NobleDevice.HeartRateMeasumentService);
//NobleDevice.Util.mixin(Remble, NobleDevice.TandDUpDnService);
var _TandDUpDnService = require('./remble-tuds');
NobleDevice.Util.mixin(Remble, _TandDUpDnService);


//==================================================================
Remble.prototype.getData9E01 = function()
{
    
    //console.log('---------------------------------------');
    var d = new Uint8Array(7);
    d[0] = 0x01;
    d[1] = 0x9e;
    d[2] = 0x00;
    d[3] = 0x00;
    d[4] = 0x00;
 /*   
    var output = crcCCITT(d, 5, 0x0000); // we use a 0x0000 seed
    
    var b0 = ((output >> 0) & 0xFF);
    var b1 = ((output >> 8) & 0xFF);
    var b2 = ((output >>16) & 0xFF);
    var b3 = ((output >>32) & 0xFF);
    
    d[5] = b1; //crc MSB
    d[6] = b0; //crc LSB

    console.log('getData9E01: crc = ' + output.toString(16) 
                                      + ", b3: " + b3.toString(16) 
                                      + ", b2: " + b2.toString(16) 
                                      + ", b1: " + b1.toString(16) 
                                      + ", b0: " +b0.toString(16) );
*/
    return(d);
}


var RembleBufs = require ('./remble-bufs.js');

var dBuf = new RembleBufs.Dbuf();
var uBuf = new RembleBufs.Ubuf();

D_pkt_raw = Remble.prototype.getData9E01();
dBuf.fromPkt(D_pkt_raw);
var D_DAT_Array = [];
var D_CMD_pkt = dBuf.get_D_CMD();
D_DAT_Array.push(dBuf.get_D_DAT(0));



U_DAT_len = 0; //len + cs
U_DAT_blocks = 0;

Remble.from_U_DAT_Array = function(theArray, lenthWithCS)
{
    var blocks = theArray.length;
    var len = lenthWithCS - 2;
    var pos = 0;
    
    //var upkt_raw = new Uint8Array(len);
    this.upkt_raw = new Uint8Array(len);
    for(var b=0; b<blocks; b++)
    {
        for(var i=4; i<20; i++)
        {
            pos =  b*16 + (i-4);
            if( pos >= len)
                break;
            this.upkt_raw[pos] = theArray[b][i];
            //console.log('data20[' + i + '] = ' + data20[i].toString(16) );
        }
    }
    return(this.upkt_raw);
}

function process_U_pkt(upkt)
{
    var cmd = upkt[1];
    var sts = upkt[2];
    var len = upkt[4]*256 + upkt[3];
    
    var crc = 0x0000; //crcCCITT(upkt, 5 + len, 0x0000); // we use a 0x0000 seed
    
    var crcb0 = ((crc >> 0) & 0xFF);
    var crcb1 = ((crc >> 8) & 0xFF);

    var pktb0 = upkt[5+len+1];
    var pktb1 = upkt[5+len+0];
    
    switch( cmd )
    {
        default:
            console.log('cmd = ' + cmd);
            console.log('sts = ' + sts);
            console.log('len = ' + len);

            console.log('cb0 = ' + crcb0);
            console.log('pb0 = ' + pktb0);
            console.log('cb1 = ' + crcb1);
            console.log('pb1 = ' + pktb1);
            
            break;
    }
    
}


Remble.On_U_CMD = function(data) {
    console.log("got u_cmd_Change event: ");        
    //printData20( data);
    U_CMD_pkt = data;

    var len = U_CMD_pkt[3] * 256 + U_CMD_pkt[2];
    U_DAT_len = len;
    var blocks = 1 + Math.floor((len-1)/16);
    U_DAT_blocks = blocks;
    var theArray = [];
    for(var b = 0; b<blocks; b++)
    {
        var data20 = new Buffer(20);
        theArray.push(data20);
    }
    
    U_DAT_Array = theArray;
}


var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
var DISCONNECTED_DEV     = 'disconnected:dev';      // Up (from noble ...)

Remble.On_U_DAT = function(blk) {

    var data = blk.data;
    var device = blk.device;

    //console.log('data = ' + data);
    //console.log('device = ' + device);
    //console.log("got u_dat_Change event: ");
    //printData20( data);
    
    var idx = data[0];
    U_DAT_Array[idx] = data;
    if( (idx + 1) === U_DAT_blocks) //last one
    {
        up_data_raw = Remble.from_U_DAT_Array(U_DAT_Array, U_DAT_len);

        var idAndPkt = { id : rbstate.idOrLocalName, pkt : up_data_raw };
        device.emit(UPPKTRDY_DEV, idAndPkt);

        //printData20(up_data_raw);
        process_U_pkt(up_data_raw);
        
        var u_cfm20 = new Buffer(20);
        u_cfm20[0] = 1;
        u_cfm20[1] = 0;

        device.write_U_CFM( u_cfm20, function(null_status) {
            console.log('write_U_CFM null_status = ' + null_status);
            
            //for testing device.disconnect(); // disconnect after sending u\cfm	                	                
        });
        
        //NOT HERE DUMB DUMB
        //device.disconnect(); // disconnect after sending u\cfm
    }
    //TODO
    // push data
    // check if all there -> ( send U_CFM -> emit to app got UpPacket )
    // not all there, return
    // has holes (send U_CFM resend please)
}



Remble.On_D_CFM_0 = function(data) {
        console.log("On_D_CFM_0 got d_cfm_Change event: ");
         dBuf.printData20(data);
}
//Remble.On_D_CFM_1 = function(data) {
//        console.log("On_D_CFM_1 got d_cfm_Change event: ");
//        //printData20( data);
//}


//==============================================================================
//==============================================================================
//==============================================================================
//==============================================================================
//==============================================================================
//==============================================================================


//Remble.prototype.consoleHello = function(text)
Remble.consoleHello = function(text)
{
    console.log('Remble: Hello %s', text);
}

Remble.print_bleid = function()
{
	//console.log('ble id = ' + idOrLocalName);
	console.log('ble id = ' + rbstate.idOrLocalName);
}


// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
/*
Remble.connectioStatusCallback = function(idAndStatus) {
    console.log('connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
    socket.emit('connectionStatus', idAndStatus);
};

socket.on('doConnect', function(id) {
    Remble.doDiscover_ConnectAndSetup(id, connectioStatusCallback);
});

socket.on('doDisconnect', function(id) {
    Remble.doDisconnect(id, connectioStatusCallback);
});
*/

Remble.onDisconnect = function(id, device)
{
  	console.log('disconnected fom id = ' + id + ', device = ' + device);
	rbstate.activePeripheral = null;
//NG	this.emit(DISCONNECTED_DEV);
	device.emit(DISCONNECTED_DEV);
  	//TODO signal to upper layers
  	//process.exit(0);        	
}

Remble.doDisconnect = function(id, callback)
{
	rbstate.activePeripheral.disconnect( callback);
    //NobleDevice.disconnect();
}


Remble.doDiscover = function(id, callback)
{
	rbstate.idOrLocalName = id;
	rbstate.activePeripheral = null;

	//console.log('rbstate.idOrLocalName  = ' + rbstate.idOrLocalName);
	
	Remble.discover( function(device) {
		//console.log('Remble.discover -> device = ' + device);
		rbstate.activePeripheral = device;
        rbstate.activePeripheral.on('disconnect', function( _this_is_undifined) {
			console.log('Peripheral.on( disconnect _this_is_undifined = ' + _this_is_undifined);
        	Remble.onDisconnect(id, device);
    	});
        //device.on('disconnect', function() {
        //    console.log('disconnected!');
	    //     process.exit(0);        
    	//});
    	callback(rbstate.activePeripheral);
    });
}


Remble.doConnectAndSetup = function(device, callback)
{
	//========== DN ==========
    device.on('d_cfm_Change', Remble.On_D_CFM_0 ); // .on -> addListener
    //device.removeListener('d_cfm_Change', Remble.On_D_CFM_0 ); //.off = X removeListener
    //device.on('d_cfm_Change', Remble.On_D_CFM_1 );

	//========== UP ==========
	device.on('u_cmd_Change', Remble.On_U_CMD );
    device.on('u_dat_Change', Remble.On_U_DAT );


    device.connectAndSetUp( function(error) {
        if(error) {
            console.log('connectAndSetUp error? = ' + error);
            // e.g. "connectAndSetUp error? = Error: Command Disallowed (0xc)"         
        }

        //========== DN ==========
        device.notify_D_CFM(function(error) {
        	if(error)
        	    console.log('set notify D_CFM error : ' + error);
        });

        //========== UP ==========
        device.notify_U_CMD(function(error) {
        	if(error)
        	    console.log('set notify U_CMD error : ' + error);
        });
        device.notify_U_DAT(function(error) {
        	if(error)
        	    console.log('set notify U_DAT error : ' + error);
        });
/*        
        //printData20(D_CMD_pkt);
        device.write_D_CMD( D_CMD_pkt, function(status) {
            console.log('write_D_CMD status = ' + status);
            
            //printData20(D_DAT_Array[0]);
            device.write_D_DAT( D_DAT_Array[0], function(status) {
                console.log('write_D_DAT status = ' + status);
            });
        });
*/
		callback(true);
    });

}


//Remble.prototype.doDiscover_ConnectAndSetup = function(id, statusCallback)
Remble.doDiscover_ConnectAndSetup = function(id, statusCallback)
{
	Remble.doDiscover(id, function(peripheral){

		if(peripheral)
		{
			//rbstate.activePeripheral = peripheral;
			//rbstate.idOrLocalName = id;
			Remble.doConnectAndSetup( peripheral, function(status) {
				console.log('doConnectAndSetup done status = ' + status);
            	var idAndStatus = { id : id, status : status};
            	statusCallback(idAndStatus);
			});
		}
		else
		{
        	var idAndStatus = { id : id, status : false};
        	statusCallback(idAndStatus);
		}

	});
}



// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
/*
Remble.doSendpkt = function(idAndPkt) { //, callback) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;
    Remble.doSend(id, pkt, function(idAndStatus){
        console.log('doSend (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
        //callback(idAndStatus);
    });
}

socket.on('doSend', Remble.doSendpkt);
*/
//Remble.prototype.doSend = function(id, pkt, statusCallback)
Remble.doSend = function(id, pkt, statusCallback)
{
	var device = rbstate.activePeripheral;
    console.log('========== Remble.doSend ==========');

    console.log('-> write_D_CMD');
    //dBuf.printData20(D_CMD_pkt);
    device.write_D_CMD( D_CMD_pkt, function(status) {
        console.log('write_D_CMD status = ' + status);
        
    console.log('-> write_D_DAT');
        //D_DAT_Array[0][12]=42;
        //dBuf.printData20(D_DAT_Array[0]);
        device.write_D_DAT( D_DAT_Array[0], function(status) {
            console.log('write_D_DAT status = ' + status);

            var idAndStatus = { id : id, status : true};
            statusCallback(idAndStatus);
        });
    });

}

// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP


// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST



module.exports = Remble;