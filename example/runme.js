
var fs = require('fs'),
    shapefile = require('shapefile-stream'),
    suggester = require('pelias-suggester-pipeline'),
    settings = require('pelias-config').generate(),
    esbackend = require('../src/es_backend'),
    mapper = require('../src/mapper');

// use datapath setting from your config file
var basepath = settings.imports.quattroshapes.datapath;

// testing
// basepath = '/media/hdd/osm/quattroshapes/simplified';

var imports = [
  {
    path: basepath + '/admin0-0001.shp',
    props: { name: 'qs_a0', admin0: 'qs_adm0', admin1: 'qs_adm1', admin2: 'qs_adm2', gn: 'gs_gn_id', woe: 'qs_woe_id' },
    index: 'pelias',
    type: 'admin0'
  },
  {
    path: basepath + '/admin1-0001.shp',
    props: { name: 'qs_a1', admin0: 'qs_adm0', admin1: 'qs_adm1', admin2: 'qs_adm2', gn: 'gs_gn_id', woe: 'qs_woe_id' },
    index: 'pelias',
    type: 'admin1'
  },
  {
    path: basepath + '/admin2-0001.shp',
    props: { name: 'qs_a2', admin0: 'qs_adm0', admin1: 'qs_adm1', admin2: 'qs_adm2', gn: 'gs_gn_id', woe: 'qs_woe_id' },
    index: 'pelias',
    type: 'admin2'
  },
  {
    path: basepath + '/localadmin-0001.shp',
    props: { name: 'qs_la', admin0: 'qs_adm0', admin1: 'qs_adm1', admin2: 'qs_adm2', gn: 'gs_gn_id', woe: 'qs_woe_id' },
    index: 'pelias',
    type: 'local_admin'
  },
  {
    path: basepath + '/localities-0001.shp',
    props: { name: 'qs_loc', admin0: 'qs_adm0', admin1: 'qs_adm1', admin2: 'qs_adm2', gn: 'gs_gn_id', woe: 'qs_woe_id' },
    index: 'pelias',
    type: 'locality'
  },
  {
    path: basepath + '/neighborhoods-0001.shp',
    props: { name: 'name', admin0: 'name_adm0', admin1: 'name_adm1', admin2: 'name_adm2', gn: 'gn_id', woe: 'woe_lau' },
    index: 'pelias',
    type: 'neighborhood'
  }
];

var found = false;
imports.forEach( function( shp ){
  if( shp.type === process.argv[2] ){
    console.log( 'running imports for: %s', shp.type );
    found = true;

    if( !fs.existsSync( shp.path ) ){
      console.error( 'failed to load %s', shp.path );
      console.error( 'please check your paths and try again' );
      process.exit(1);
    }

    shapefile.createReadStream( shp.path )
      .pipe( mapper( shp.props, shp.type ) )
      .pipe( suggester.pipeline )
      .pipe( esbackend( shp.index, shp.type ).createPullStream() );
  }
});

if( !found ){
  console.log( 'please select an import...' );
  console.log( imports.map( function( i ){
    return i.type;
  }).join(', '));
  process.exit(1);
}