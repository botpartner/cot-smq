var net = require('net');
var time = require('time');
var sleep = require('sleep');
var _ = require('lodash');

var vendor = '__YOUR_COT_VENDER_ID__';
var device = '__YOUR_COT_DEVICE_ID__';
var uuid  = '__YOUR_COT_HOST_UUID__'; //your UUID
var auth_token = '__YOUR_COT_TOKEN__';

var owner  = '__YOUR_COT_OWENER_ID__';
var group  = '__YOUR_COT_GROUP_ID__';

var remote_ip = '__YOUR_COT_SMQ_SERVER_IP__';
var remote_port = __YOUR_COT_SMQ_SERVER_PORT__;


var client = new net.Socket();
var client_active = false;
var curr_cid = 0;

function socket_log (  type , msg ) {
  var now = new time.Date();
  //now.setTimezone("America/Los_Angeles");
  now.setTimezone("Asia/Taipei");

  console.log( now.toString() + " : ["+type+"] "+ msg );
}


function new_connect () {
  client = new net.Socket();
  var my_cid = curr_cid++;

  function connect_do () {
    client_active = true ;
    console.log('Connected with CID = '+ my_cid );

    client.setEncoding('utf8');

    //while(1){
    client.write(JSON.stringify({
      vendor: vendor,
      device: device,
      uuid:   uuid, //your UUID
      token:  auth_token,
      action: 'update'
    }));
    //}

    // body...
  }

  client.connect( remote_port , remote_ip, connect_do );

  try{
  client.on('data', function(data) {
    var now = new time.Date();
    //now.setTimezone("America/Los_Angeles");
    now.setTimezone("Asia/Taipei");
    console.log( now.toString() + ' : Got data from : ' +client.remoteAddress +"\tpost : "+client.remotePort +"\t read Byte : "+ data.length );

    try {
      curr_data = JSON.parse( data );
      data_emit = curr_data.data;

      if( data_emit ){
        _.each( data_emit , function  ( val , key ) {
          data_emit[key] = ! val ;
        });

        //console.log(data_emit);

        var prepare_data = JSON.stringify({
          vendor: vendor,
          device: device,
          uuid:   uuid, //your UUID
          token:  auth_token,
          action: 'emit',
          data: data_emit
        });

        console.log(prepare_data);
        client.write( prepare_data );
      }else{
        //client.write(JSON.stringify({
        //vendor: vendor,
        //device: device,
        //uuid:   uuid, //your UUID
        //token:  auth_token,
        //action: 'update'
        //}));
        client.end( JSON.stringify({
          uuid:   uuid, //your UUID
          action: 'close'
        }), 'utf8' );
      }

      //client.end( prepare_data );

    } catch (e) {
      console.log("unkenow HEADER , not JSON");
      //console.log(e);
    }
    //client.destroy(); // kill client after server's response
  });

  client.on('close', function() {
    console.log('CID = '+ my_cid+' Connection closed');
    client.destroy();
    if(client_active){
      sleep.sleep(1);
      client_active = false;
      new_connect();
    }else{
      client_active = false;
    }
    //client.connect( remote_port , remote_ip, connect_do );
    //new_connect();
  });
  } catch (e){
    console.log(e);
  }

  client.on('error', function  (e) {
    client_active = false;
    console.log(e);
    switch(e.code){
      case 'ECONNREFUSED' :
        socket_log( 'ERROR' , 'CID = '+my_cid+' Address in use, retrying...');
        setTimeout(() => {
          client.destroy();
          new_connect();
        }, 1000);
        break;
      default:
        //EADDRNOTAVAIL
        socket_log( 'ERROR' , 'CID = '+my_cid+' Address in use, retrying...');
        setTimeout(() => {
          client.destroy();
          new_connect();
        }, 1000);
        break;
    }

    //sleep.sleep(1);
    //client.destroy();
    //client.connect( remote_port , remote_ip, connect_do );
    //new_connect();
  });

}

new_connect();
