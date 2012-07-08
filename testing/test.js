require.config({
	baseUrl : '../src',
	paths : {
		tests : '../testing/tests',
		lib : '../lib'
	}
})

require(['tests/util', 'tests/api', 'tests/undomanager', 'tests/rearrangeablelist'], function() {

	QUnit.start()
})