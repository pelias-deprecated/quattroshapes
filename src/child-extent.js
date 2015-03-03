
var extent = require('geojson-extent');
process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf-8');

var data = '';
process.stdin.on('data', function( chunk ) {
  if( chunk ) data += chunk.toString();
});

process.stdin.on('close', function() {
  try {
    var json = JSON.parse( data );
    var bounds = extent( json );
    var output = JSON.stringify( bounds );
    process.stdout.write( output, function(){
      setImmediate( process.exit.bind( process, 0 ) );
    });
  }
  catch( e ){
    process.stderr.write( e.message, function(){
      setImmediate( process.exit.bind( process, 1 ) );
    });
  }
});

process.stdin.on( 'error', console.error.bind( console, 'child.stdin.err' ) );
process.stdout.on( 'error', console.error.bind( console, 'child.stdout.err' ) );
