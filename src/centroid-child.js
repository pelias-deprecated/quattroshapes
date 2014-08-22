
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
  child.stdin.setEncoding = 'utf-8';

  var stdout = '';
  child.stdout.on( 'data', function( chunk, enc ){
    stdout += chunk.toString();
  });

  var stderr = '';
  child.stderr.on( 'data', function( chunk, enc ){
    stderr += chunk.toString();
  });

  child.stdout.on( 'close', function(){
    var json = null;
    try {
      // console.log( 'parse stdout', '~~' + stdout + '~~' );
      json = JSON.parse( stdout );
    }
    catch ( e ){
      return cb( stderr || e || 'error parsing json' );
    }
    return cb( null, json );
  });

  child.on( 'error', console.error.bind( console, 'child.err' ) );
  child.stdin.on( 'error', console.error.bind( console, 'stdin.err' ) );
  child.stdout.on( 'error', console.error.bind( console, 'stdout.err' ) );

  child.stdin.write( JSON.stringify( geometry ), function(){
    child.stdin.end();
  });
}

module.exports = function( geometry, cb ){

  getJsonCenterExec( geometry, function( err, bounds ){

    if( err ) return cb( err );

    var center = geolib.getCenter([
      [ bounds[0], bounds[1] ],
      [ bounds[2], bounds[3] ]
    ]);

    if( center.latitude && center.longitude ){
      var centroid = { lat: center.latitude, lon: center.longitude };
      return cb( null, centroid );
    }

    return cb( 'geolib.getCenter failed' );
  });
};
