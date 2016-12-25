var net = require('net');

var client = new net.Socket();

var vendor = '__YOUR_COT_VENDER_ID__';
var device = '__YOUR_COT_DEVICE_ID__';
var uuid  = '__YOUR_COT_HOST_UUID__'; //your UUID
var auth_token = '__YOUR_COT_TOKEN__';

var owner  = '__YOUR_COT_OWENER_ID__';
var group  = '__YOUR_COT_GROUP_ID__';

var remote_ip = '__YOUR_COT_SMQ_SERVER_IP__';
var remote_port = __YOUR_COT_SMQ_SERVER_PORT__;

var _ = require('lodash');
client.connect( remote_port , remote_ip, function() {
  console.log('Connected');

  client.setEncoding('utf8');

  client.write(JSON.stringify({
    vendor: vendor,
    device: device,
    uuid:   uuid, //your UUID
    token:  auth_token,
    action: 'update'
  }));


});

client.on('data', function(data) {
  console.log('Received: ');
  console.log( data );

  //try {
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
    client.end( JSON.stringify({
      uuid:   uuid, //your UUID
      action: 'close'
    }), 'utf8' );
  }

  //client.end( prepare_data );

  //} catch (e) {
  //console.log("unkenow HEADER , not JSON");
  //console.log(e);
  //}
  //client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
});
