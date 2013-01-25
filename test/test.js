var FS = require( 'fs' );
var Parser = require( '../lib/index' );

//var data = FS.readFileSync( './wmic.log' ).toString();
var data = FS.readFileSync( './data' ).toString();
var parsedData = Parser.parse( data );

console.log( parsedData );