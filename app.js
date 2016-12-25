//process.env.TZ ='Asia/Taipei';
var net = require('net');
var _ = require('lodash');
var time = require('time');

var clients = [];
var auth_token = '__YOUR_COT_TOKEN__';
var listen_ip = '__YOUR_COT_SMQ_SERVER_IP__';
var listen_port = __YOUR_COT_SMQ_SERVER_PORT__;

String.prototype.hexEncode = function(){
    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
};

String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
};
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


//var str = "\u6f22\u5b57"; // "\u6f22\u5b57" === "漢字"
//console.log(str.hexEncode().hexDecode());

var data_pool = {
  0: false,
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false
};

function socket_log (  type , msg ) {
  var now = new time.Date();
  //now.setTimezone("America/Los_Angeles");
  now.setTimezone("Asia/Taipei");

  console.log( now.toString() + " : ["+type+"] "+ msg );
}

// 'connection' listener
var server = net.createServer( function (socket) {
  socket_log( 'INFO' , 'client connected !');

  socket.setEncoding('utf8');

  try{
  socket.on('data', function(chunk) {
    socket_log( 'INFO' , 'Got data from : ' +socket.remoteAddress +"\tpost : "+socket.remotePort +"\t read Byte : "+ chunk.length );

    var recieved = chunk.toString();
    //console.log( typeof recieved );
    //console.log( recieved.hexEncode() );
    recieved = recieved.replaceAll('}{' , '}}{{');
    var commands = recieved.split('}{');
    console.log(commands);


    _.each( commands , function  ( is_command ) {

      var command = {};
      try {
        //JSON.parse(x);
        var command = JSON.parse( is_command );
      } catch (e) {
        socket_log( 'WARNING' , 'Unkenow HEADER , not JSON');
        //console.log( e );
        //socket.end();
      }

      try {
        if(command && socket.writable ){
          switch(command.action){
            case 'close':
              break;
            case 'update':
              if( command.token == auth_token ){
              socket.write(JSON.stringify({
                token:  auth_token,
                action: 'update',
                data: data_pool
              }));
            }
            break;
            case 'emit':
              if( command.token == auth_token){
              var is_datas = command.data ;

              _.each( data_pool , function  ( val , idx) {
                if( is_datas[idx] != undefined ){
                  data_pool[idx] = ( is_datas[idx] ? true : false );
                }
              });

              socket.write(JSON.stringify({
                token:  auth_token,
                action: 'ok'
              }));
            }
            break;
            default:
              break;
          }
        }
      } catch (e) {
        socket_log( 'ERROR' , 'remote socket cannot to write !');
        console.log(e);
        //socket.end();
        socket.destroy();
      }
    });
    //console.log( chunk.length );
    //socket.write(chunk);
  });
  } catch(e) {
    socket_log( 'ERROR' , 'remote socket cannot to read!');
    console.log(e);
  }

  socket.on('close', function  () {
    try{
      socket.end();
    } catch(e){
      console.log(e);
    }
    socket.destroy();
  });

  socket.on('end', () => {
    console.log('client disconnected');
    socket.destroy();
    //socket.end();
  });

  socket.on('error', function  () {
    try{
      socket.end();
    } catch(e){
      console.log(e);
    }
    socket.destroy();
  });

});

server.on('error', (e) => {
  if (e.code == 'EADDRINUSE') {
    socket_log( 'ERROR' , 'Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen( listen_port , listen_ip );
    }, 1000);
  }
});

server.listen( listen_port , listen_ip , () => {
  socket_log( 'INFO' , 'server bound !');
});

