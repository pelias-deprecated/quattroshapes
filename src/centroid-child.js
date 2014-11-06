
var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    geolib = require('geolib');

var cmd = 'node';
var file = path.resolve( __dirname + '/child-extent.js' );
var env = process.env;
env['NODE_PATH'] = path.resolve( __dirname + '/../node_modules' );

function getJsonCenterExec( geometry, cb ){

  var child = spawn( cmd, [file], { env: env } );
  child.stdin.setEncoding('utf-8');
  child.stdout.setEncoding('utf-8');

  var stdout = '';
  child.stdout.on( 'data', function( chunk, enc ){
    if( chunk ) stdout += chunk.toString();
  });

  var stderr = '';
  child.stderr.on( 'data', function( chunk, enc ){
    if( chunk ) stderr += chunk.toString();
  });

  child.stdout.on( 'close', function(){
    var json = null;
    var err = null;
    try {
      // console.log( 'parse stdout', '~~' + stdout + '~~' );
      json = JSON.parse( stdout );
    }
    catch ( e ){
      err = stderr || e || 'error parsing json';
    }
    return cb( err, json );
  });

  child.on( 'error', console.error.bind( console, 'child.err' ) );
  child.stdin.on( 'error', console.error.bind( console, 'stdin.err' ) );
  child.stdout.on( 'error', console.error.bind( console, 'stdout.err' ) );

  var json = JSON.stringify( geometry );
  // if( !json ){
  //   console.log( JSON.stringify( json, null, 2 ) );
  //   console.log( json );
  //   console.log( 'null json' );
  //   process.exit(1);
  // }

  child.stdin.write( json, function(){
    setImmediate( child.stdin.end.bind( child.stdin ) );
  });
}

module.exports = function( geometry, cb ){

  getJsonCenterExec( geometry, function( err, bounds ){

    if( err ) return cb( err );

      // console.log( bounds );
    if( Array.isArray( bounds ) && bounds.length >= 4 ){

      try {
        var center = geolib.getCenter([
          [ bounds[0], bounds[1] ],
          [ bounds[2], bounds[3] ]
        ]);

        if( center.latitude && center.longitude ){
          var centroid = { lat: center.latitude, lon: center.longitude };
          return cb( null, centroid );
        }
      } catch ( e ){
        return cb( e );
      }

    }

    console.error( 'invalid bounds', bounds );
    return cb( 'geolib.getCenter failed' );
  });
};
