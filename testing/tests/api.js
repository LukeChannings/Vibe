define(['api.vibe'], function(VibeApi) {

	module("VibeApi test")
	
	test("Create instance without options.", function() {
	
		raises(function() {
		
			new VibeApi()
		
		}, "Constructing without options will result in an error.")
	})
	
	asyncTest("Create an instance with valid options", function() {
	
		expect(11)

		var api = new VibeApi({
			host : "channings.me",
			port : 6232,
			onconnect : function() {
			
				ok(true, "Api connected successfully.")
				
				equal(api.connecting, false, "Api should not be connecting.")
				equal(api.connected, true, "Api should be connected.")
				equal(api.disconnected, false, "Api should not be disconnected.")
				
				api.disconnect()
			},
			ondisconnect : function() {
			
				ok(true, "Api disconnected successfully.")
				
				equal(api.connecting, false, "Api should not be connecting.")
				equal(api.connected, false, "Api should not be connected.")
				equal(api.disconnected, true, "Api should be disconnected.")
				
				start()
			},
			onerror : function() {
			
				ok(false, "Did not connect to valid server. Detected an error after " + (new Date().getTime() - timestamp) + "ms.")

				start()
			}
		})
		
		equal(api.connecting, false, "Api should not connect by default.")
		equal(api.connected, false, "Api should not be connected.")
		equal(api.disconnected, true, "Api should be disconnected by default.")
		
		var timestamp = new Date().getTime()

		api.connect()
	})
	
	asyncTest("Create an instance with invalid host", function() {
	
		var api = new VibeApi({
			host : 'bobberson.net',
			port : 6232,
			onerror : function() {
				
				ok(true, "Error was detected after " + (new Date().getTime() - timestamp) + "ms")
				
				equal(api.connected, false, "Api should not be connected.")
				equal(api.connecting, false, "Api should not be connecting.")
				equal(api.disconnected, true, "Api should be disconnected.")
				
				start()
			}
		})
		
		var timestamp = new Date().getTime()
		
		api.connect()
	})
})
