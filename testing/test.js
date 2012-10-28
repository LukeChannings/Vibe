// requirejs configuration.
require.config({
	baseUrl : '../src',
	paths : {
		tests : '../testing/tests',
		lib : '../lib'
	}
})

// test module.
define(function( require ) {

	// tests
	var util = require('tests/util'),
		api = require('tests/api'),
		undomanager = require('tests/undomanager'),
		contextmenu = require('tests/contextmenu'),
		rearrangeablelist = require('tests/rearrangeablelist')

	// start QUnit when the tests have been loaded.
	QUnit.start()
})