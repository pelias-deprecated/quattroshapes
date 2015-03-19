/**
 * @file The importer's unit-tests.
 */

'use strict';

var mapper = require( '../src/mapper' );
var tape = require( 'tape' );

tape( 'capitalize() correctly normalizes strings.', function ( test ){
  var testCases = [
    [ 'multi word name', 'Multi Word Name' ],
    [ '***multi word name', 'Multi Word Name' ],
    [ 'hyphenated-name', 'Hyphenated-Name' ]
  ];
  test.plan( testCases.length );
  testCases.forEach( function ( testCase ){
    test.equal(
      mapper.capitalize( testCase[ 0 ] ), testCase[ 1 ],
      'Capitalized/normalized name matches expected.'
    );
  });
});
