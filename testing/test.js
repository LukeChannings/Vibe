require.config({
	baseUrl : '../src',
	paths : {
		tests : '../testing/tests',
		lib : '../lib'
	}
})

require(['tests/util', 'tests/api', 'tests/undomanager', 'tests/contextmenu'], function() {

	// start QUnit when the tests have been loaded.
	QUnit.start()
})