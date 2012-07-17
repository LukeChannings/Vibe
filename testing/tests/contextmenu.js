define(['util', 'model.contextMenus'], function(util, ContextMenus) {

	module("context Menu Model", {
		setup : function() {
		
			this.menus = new ContextMenus()
		}
	})
	
	test("add empty context", function() {
	
		var a = this.menus.addContext("abc")
		
		ok(a, "addContext should return true.")
		
		deepEqual(this.menus.contexts.abc, [], "The context should default to an empty object.")
		
		a = this.menus.addContext()
		
		ok(!a, "addContext should return false.")
	})
	
	test("add context with items.", function() {
	
		var a = this.menus.addContext("abc", [{ title : "click me", callback : function() {} }])
		
		ok(a, "addContext should return true.")
		
		a = this.menus.addContext("abc")
		
		ok(!a, "addContext should return false.")
	})
	
	test("remove context", function() {
	
		var a = this.menus.addContext("abc")
		
		ok(a, "context abc should be created.")
		
		ok(this.menus.contexts.abc, "context abc should exist")
		
		a = this.menus.removeContext("abc")
		
		ok(a, "context abc should be removed")
		
		ok(!this.menus.contexts.abc, "context abc should not exist.")
	})
	
	test("remove context item", function () {
	
		var contextItems = [{
			title : "Item 1",
			callback : function() {}
		},{
			title : "Item 2",
			callback : function() {}
		}]
	
		var a = this.menus.addContext("abc", contextItems)
		
		ok(a, "context should be added.")
		
		a = this.menus.removeContextItem("abc", contextItems[0])
		
		ok(a, "context item should be removed.")
		
		ok(!this.menus.contexts.abc.indexOf(contextItems[0]), "context item should not exist.")
	})
	
	test("add context item", function () {
	
		var a = this.menus.addContext("abc"),
			item = {
				title : "Item 1",
				callback : function() {}
			}
	
		ok(a, "context should be added.")
	
		a = this.menus.addContextItem("abc", item)
	
		ok(a, "item should be added.")
		
		a = this.menus.removeContextItem("abc", item)
		
		ok(a, "item should be removed")
		
		equal(this.menus.contexts.abc.length, 0, "there should be zero items for abc context.")
	})
	
	test("get context", function () {
	
		var items = [{title : "Item 1", callback : function () {}}],
			a = this.menus.addContext("abc", items)
	
		ok(a, "context abc should be added.")
		
		equal(items, this.menus.getContext("abc"), "items returned by getContext should be equal to the items.")
	})
})