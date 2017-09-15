

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

//NG Remble.on('jhgg', function(){}); //error?
//==================================================================
//==================================================================
//==================================================================

/*
// https://gist.github.com/bewest/9559812
var crc_table = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
  0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
  0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
  0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
  0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
  0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
  0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
  0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
  0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
  0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
  0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
  0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
  0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
  0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
  0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
  0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
  0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
  0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
  0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
  0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
  0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
  0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
  0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
  0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
  0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
  0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
  0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
  0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
  0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
  0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
  0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
  0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
  0x2e93, 0x3eb2, 0x0ed1, 0x1ef0

];

function crcCCITT (input, seed) {
  var result = seed;
  var temp;

  for (var i = 0, len = input.length; i < len; ++i) {
    temp = (input[i] ^ (result >> 8)) & 0xFF;
    result = crc_table[temp] ^  (result << 8);
  }
  return result;
}
function crcCCITT (input, mylen, seed) {
  var result = seed;
  var temp;

//for (var i = 0, len = input.length; i < len; ++i) {
  for (var i = 0, len = mylen; i < len; ++i) {
    temp = (input[i] ^ (result >> 8)) & 0xFF;
    result = crc_table[temp] ^  (result << 8);
  }
  return result;
}


function crc16CCITT(buf, seed) // NG?
  {
    var crc = Number.isNaN(seed) ? 0xFFFF : seed;
    for (var i = 0, len = buf.length; i < len; ++i)
    {
      crc = (((crc >> 8) & 0xFF) | ((crc << 8) & 0xFFFF));
      crc ^= buf[i];
      crc ^= ((crc >> 4) & 0xFF);
      crc ^= ((((crc << 8) & 0xFFFF) << 4) & 0xFFFF);
      crc ^= (((((crc & 0xFF) << 4) & 0xFFFF) << 1) & 0xFFFF);
    }
    return crc;
}

function dumb1 ()
{
    console.log('---------------------------------------');
    var input = new Buffer( [ 0x02, 0x06, 0x06, 0x03 ] );
    var output = crc16CCITT(input);
    var o = new Buffer([output >> 8, output & 0xFF]);
    console.log('output:', output, o.toString('hex'));
    var c = new Buffer([0x41, 0xCD]);
    console.log("(correct is)", 0x41CD, c.toString('hex'));

    var input = new Buffer( [ 0x02, 0x06, 0x06, 0x03 ] );
    console.log('attempt 2');
    output = crcCCITT(input, 0xFFFF);
    o = new Buffer([output >> 8, output & 0xFF]);
    console.log('output:', output, o.toString('hex'));
    console.log("(correct is)", 0x41CD )://, c.toString('hex'));   
}




Remble.prototype.getData9E01 = function()
{
    dumb1();
    
    console.log('---------------------------------------');
    var d = new Uint8Array(7);
    d[0] = 0x01;
    d[1] = 0x9e;
    d[2] = 0x00;
    d[3] = 0x00;
    d[4] = 0x00;
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

    return(d);
}

Remble.prototype.getData9E02 = function()
{
    //01 9e 02 04 00 00 01 f0 0a a0 01
    
    console.log('---------------------------------------');
    var d = new Uint8Array(11);
    d[0] = 0x01;
    d[1] = 0x9e;
    d[2] = 0x02;
    d[3] = 0x04;
    d[4] = 0x00;
    d[5] = 0x00;
    d[6] = 0x01;
    d[7] = 0xf0;
    d[8] = 0x0a;
    var output = crcCCITT(d, 9, 0x0000); // we use a 0x0000 seed
    
    var b0 = ((output >> 0) & 0xFF);
    var b1 = ((output >> 8) & 0xFF);
    var b2 = ((output >>16) & 0xFF);
    var b3 = ((output >>32) & 0xFF);
    
    d[9] = b1; //crc MSB
    d[10] = b0; //crc LSB

    console.log('getData9E02: crc = ' + output.toString(16) 
                                      + ", b3: " + b3.toString(16) 
                                      + ", b2: " + b2.toString(16) 
                                      + ", b1: " + b1.toString(16) 
                                      + ", b0: " +b0.toString(16) );

    return(d);
}

function getCheckSum(datain)
{
    var len = datain.length;
    var cs = 0;
    for(var i=0; i<len; i++)
    {
        cs += datain[i];
    }
    return(cs);
}

function addCheckSum(datain)
{
    var len = datain.length;

    var dataout = new Uint8Array(len+2);
    var cs = getCheckSum(datain);
    var b0 = ((cs >> 0) & 0xFF);
    var b1 = ((cs >> 8) & 0xFF);
    for(var i=0; i<len; i++)
    {
        dataout[i] = datain[i];
    }
    dataout[i++] = b0; //LSB first
    dataout[i++] = b1; //MSB second
    return(dataout);
}

Remble.prototype.make_D_CMD = function( len )
{
    var data20 = new Buffer(20);

    data20.writeInt8( 1, 0);
    data20.writeInt8( 1, 1);
    data20.writeInt8( ((len>>0) & 0xff) , 2);
    data20.writeInt8( ((len>>8) & 0xff) , 3);
    
    //data20[0] = 1;
    //data20[1] = 1;
    //data20[2] = ((len>>0) & 0xff);
    //data20[3] = ((len>>8) & 0xff);
    
    return(data20);
}

Remble.prototype.make_D_DAT_Array = function( datain )
{
    console.log('');
    var len = datain.length;
    //var quotient = Math.floor(y/x);
    //var remainder = y % x;
    var blocks = 1 + Math.floor((len-1)/16);
    var theArray = [];
    console.log('len    = ' + len);
    console.log('blocks = ' + blocks);
    for(var b = 0; b<blocks; b++)
    {
        var data20 = new Buffer(20);

        data20.writeInt8( b, 0);
        data20.writeInt8( 0, 1);
        data20.writeInt8( 0, 2);
        data20.writeInt8( 0, 3);

        //data20[0] = b;
        //data20[1] = 0x00;
        //data20[2] = 0x00;
        //data20[3] = 0x00;

        for(var i=4; i<20; i++)
        {
            data20.writeUInt8( datain[ b*16 + (i-4)], i);
          //data20[i] = datain[ b*16 + (i-4)];
            console.log('data20[' + i + '] = ' + data20[i].toString(16) );
        }
        theArray.push(data20);
    }
    console.log('theArray = ' + theArray);
    console.log('theArray.length = ' + theArray.length);
    return(theArray);
}

Remble.prototype.get_D_DAT = function( idx )
{    
    return( D_DAT_Array[idx] );
}




function printData20(data20)
{
    var len = data20.length;
    
    //for(var i=0; i<20; i++)
    for(var i=0; i<len; i++)
    {
        console.log('data20[' + i + '] = ' + data20[i].toString(16) + ' (' +data20[i].toString(10)+ ')');                
    }
    console.log(' data20 len = '+ data20.length);
}

function printArray(array)
{
    var len = array.length;
    for(var i=0; i<len; i++)
    {
        var data20 = array[i];
        printData20(data20);
    }
}

*/



Remble.prototype.getData9E01 = function()
{
    //dumb1();
    
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
//D_pkt_raw = Remble.prototype.getData9E02();

//D_pkt_cs = addCheckSum(D_pkt_raw);
//D_CMD_pkt = Remble.prototype.make_D_CMD(D_pkt_cs.length);
//D_DAT_Array = Remble.prototype.make_D_DAT_Array(D_pkt_cs);


var RembleBufs = require ('./remble-bufs.js');

var dBuf = new RembleBufs.Dbuf();
var uBuf = new RembleBufs.Ubuf();

D_pkt_raw = Remble.prototype.getData9E01();
dBuf.fromPkt(D_pkt_raw);
var D_DAT_Array = [];
var D_CMD_pkt = dBuf.get_D_CMD();
D_DAT_Array.push(dBuf.get_D_DAT(0));






//printArray( D_DAT_Array );

//D_DAT_Array = Remble.prototype.make_D_DAT_Array(addCheckSum(Remble.prototype.getData9E02() ) )
//printArray( D_DAT_Array );

U_DAT_len = 0; //len + cs
U_DAT_blocks = 0;

Remble.from_U_DAT_Array = function(theArray, lenthWithCS)
{
    var blocks = theArray.length;
    var len = lenthWithCS - 2;
    var pos = 0;
    
    var upkt_raw = new Uint8Array(len);
    for(var b=0; b<blocks; b++)
    {
        for(var i=4; i<20; i++)
        {
            pos =  b*16 + (i-4);
            if( pos >= len)
                break;
            upkt_raw[pos] = theArray[b][i];
            //console.log('data20[' + i + '] = ' + data20[i].toString(16) );
        }
    }
    return(upkt_raw);
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



//printData20(D_CMD_pkt);
//printData20(D_DAT_Array[0]);

//Remble.prototype.On_D_CFM_0 = function(data) {
Remble.On_D_CFM_0 = function(data) {
        console.log("On_D_CFM_0 got d_cfm_Change event: ");
        //printData20( data);
}

//Remble.prototype.On_D_CFM_1 = function(data) {
Remble.On_D_CFM_1 = function(data) {
        console.log("On_D_CFM_1 got d_cfm_Change event: ");
        //printData20( data);
}


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

Remble.onDisconnect = function()
{
  	console.log('disconnected!');
	rbstate.activePeripheral = null;
  	//TODO signal to upper layers
  	//process.exit(0);        	
}

Remble.doDisonnect = function(id, callback)
{
	rbstate.activePeripheral.disconnect( callback);
    //NobleDevice.disconnect();
}

Remble.doDiscover = function(id, callback)
{
	rbstate.idOrLocalName = id;
	rbstate.activePeripheral = null;

console.log('rbstate.idOrLocalName  = ' + rbstate.idOrLocalName);
	
	Remble.discover( function(device) {
console.log('Remble.discover -> device = ' + device);

		rbstate.activePeripheral = device;

   
        rbstate.activePeripheral.on('disconnect', function(xxx) {
console.log('Peripheral.on( disconnect xxx = ' + xxx);
        	Remble.onDisconnect();
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
    device.on('d_cfm_Change', Remble.On_D_CFM_0 ); // .on -> addListener
    //device.removeListener('d_cfm_Change', Remble.On_D_CFM_0 ); //.off = X removeListener
    device.on('d_cfm_Change', Remble.On_D_CFM_1 );

	//========== UP ==========
    // U_CMD callack
	device.on('u_cmd_Change', function(data) {
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
	});
    
    // U_DAT callack
    device.on('u_dat_Change', function(data) {
        console.log("got u_dat_Change event: ");
        //printData20( data);
        var idx = data[0];
        U_DAT_Array[idx] = data;
        if( (idx + 1) === U_DAT_blocks) //last one
        {
            up_data_raw = Remble.from_U_DAT_Array(U_DAT_Array, U_DAT_len);
            //printData20(up_data_raw);
            process_U_pkt(up_data_raw);
            
            var u_cfm20 = new Buffer(20);
            u_cfm20[0] = 1;
            u_cfm20[1] = 0;

            device.write_U_CFM( u_cfm20, function(status) {
                console.log('write_U_CFM status = ' + status);
                device.disconnect(); // disconnect after sending u\cfm	                	                
            });
            
            //NOT HERE DUMB DUMB
            //device.disconnect(); // disconnect after sending u\cfm
        }
	    //TODO
	    // push data
	    // check if all there -> ( send U_CFM -> emit to app got UpPacket )
	    // not all there, return
	    // has holes (send U_CFM resend please)
	});


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

    //printData20(D_CMD_pkt);
    device.write_D_CMD( D_CMD_pkt, function(status) {
        console.log('write_D_CMD status = ' + status);
        
        //printData20(D_DAT_Array[0]);
        device.write_D_DAT( D_DAT_Array[0], function(status) {
            console.log('write_D_DAT status = ' + status);
        });
    });

	var status = true;
	statusCallback(status);
}

// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
/*
Remble.onRecvpkt = function(idAndPkt) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;

    console.log('onRecvPkt (id = ' + idAndStatus.id + ') pkt.len = ' + idAndStatus.pkt.length);

}
*/
//NG Remble.on('pktUp',Remble.onRecvpkt);

// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
/*
Remble.doDiscover_ConnectAndSetup(Remble.idOrLocalName, function(idAndStatus) {
    console.log('connectionStatus (id = ' + idAndStatus.id + ') status = ' + idAndStatus.status);
    
    var _pkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0x00,0x00];
    var idAndPkt = { id : Remble.idOrLocalName, pkt : _pkt };
    Remble.doSendpkt (idAndPkt);
});
*/

//----- ???? -----
Remble.prototype.dummyEmitUpPkt = function(data) {
  this.on_U_PKT_RDY_Binded = this.on_U_PKT_RDY.bind(this);
  this.on_U_PKT_RDY_Binded(data);
};


Remble.prototype.on_U_PKT_RDY = function(data) {
    this.emit('pktUp', data);
};


module.exports = Remble;