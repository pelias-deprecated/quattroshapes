
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
    // console.error( 'data', data );
    var bounds = extent( json );
    // console.error( 'bounds', bounds );
    var output = JSON.stringify( bounds );
    // console.error( 'output', output );
    // if( !bounds ){
    //   // process.stderr.write( json );
    //   process.stderr.write( 'foo1' );
    //   process.stderr.write( data );
    //   process.stderr.write( JSON.stringify( json, null, 2 ) );
    //   process.stderr.write( JSON.stringify( bounds, null, 2 ) );
    //   process.stderr.write( JSON.stringify( output, null, 2 ) );
    //   process.stderr.write( typeof output );
    // }
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
