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

    client.end( JSON.stringify({
      uuid:   uuid, //your UUID
      action: 'close'
    }), 'utf8' );

});

client.on('data', function(data) {
	console.log('Received: ');
	console.log( data );
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});
