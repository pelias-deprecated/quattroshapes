
var extent = require('geojson-extent');
process.stdin.setEncoding('utf8');

var data = '';
process.stdin.on('data', function( chunk ) {
  if( null !== chunk ){ data += chunk; }
});

process.stdin.on('end', function() {
  try {
    var json = JSON.parse( data );
    var bounds = extent( json );
    process.stdout.write( JSON.stringify( bounds ) );
    process.exit(0);
  }
  catch( e ){
    process.stderr.write( e );
    process.exit(1);
  }
});

process.stdin.on( 'error', console.error.bind( console, 'child.stdin.err' ) );
process.stdout.on( 'error', console.error.bind( console, 'child.stdout.err' ) );
