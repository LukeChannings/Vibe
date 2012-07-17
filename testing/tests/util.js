define(['util'], function(util) {

	module("Utility methods")

	test("formatTime test", function () {
	
		expect(2)
	
		equal(util.formatTime(90), "01:30", "Expect 90 seconds to be 01:30")
		
		equal(util.formatTime(500), "08:20", "Expect 500 seconds to be 08:20")
	})
	
	test("expandTime test", function () {
	
		expect(6)
		
		equal(util.expandTime(100), "1 minute and 40 seconds.", "100 seconds should be '1 minute and 40 seconds.'")
		
		equal(util.expandTime(900), "15 minutes.", "900 seconds should be '15 minutes.'")
		
		equal(util.expandTime(72), "1 minute and 12 seconds.", "72 seconds should be '1 minute and 12 seconds.'")
		
		equal(util.expandTime(8273), "2 hours, 17 minutes and 53 seconds.", "8273 seconds should be '2 hours, 17 minutes and 13 seconds.'")
		
		equal(util.expandTime(262), "4 minutes and 22 seconds.", "262 seconds should be '4 minutes and 22 seconds.'")
		
		equal(util.expandTime(3900), "1 hour and 5 minutes.", "3900 seconds should be '1 hour and 5 minutes.'")
	})
	
	test("setArributes test", function() {
	
		var node = document.createElement('div')
		
		util.setAttributes(node, {
			'data-abc' : 'lalala',
			'id' : 'someId',
			'customClass' : 'aClassName'
		})
	
		expect(3)
	
		ok(node.getAttribute('data-abc') == 'lalala', "Test data attribute.")
		ok(node.getAttribute('id') == 'someId', "Test id attribute")
		ok(node.getAttribute('customClass') == 'aClassName', "Test class name.")
	})
	
	test("createElement test", function() {
	
		var a = util.createElement({
			'tag' : 'a',
			'inner' : 'lalala',
			'children' : [{
				'tag' : 'span',
				'inner' : 'bob'
			}]
		})
		
		expect(4)
		
		var span = a.getElementsByTagName('span')[0]
		
		equal(a.tagName, "A", "Tag name is A for Anchor.")
		equal(a.firstChild.nodeValue, "lalala", "Node text value is correct.")
		equal(span.tagName, "SPAN", "Tag name for span is SPAN.")
		equal(span.innerHTML, "bob", "Node text value is correct.")
	})
	
	test("forEach test", function() {
	
		var a = ['a', 'b', 'c', 'd', 'e', 'f']
		
		expect(1)
		
		var indexes = []
		
		util.forEach(a, function(data, index, array) {
		
			indexes.push(index)
			
		})
		
		equal(indexes.join(''), '012345', "each element should have been iterated.")
	})

	asyncTest("registerStylesheet loading already loaded stylesheet test", function() {
	
		expect(2)
	
		util.registerStylesheet("qunit/qunit.css", function(loaded) {
		
			ok(true, "Identify already loaded stylesheet.")
	
			ok(loaded, "Loaded argument should be true.")
	
			start()
	
		})
	})
	
	asyncTest("registerStylesheet loading stylesheet test", function() {
	
		expect(2)
	
		var timestamp = new Date().getTime()
	
		util.registerStylesheet("../app.css", function(state) {
		
			ok(true, "Register callback should run. Loaded in " + (new Date().getTime() - timestamp) + "ms.")
			
			ok(state, "Loaded state should be true.")
			
			start()
		})
	})
	
	asyncTest("registerStylesheet loading nonexistent stylesheet test", function() {
	
		expect(2)
	
		var time = new Date().getTime()
	
		util.registerStylesheet("thisStylesheetIsNonexistent.css", function(loaded) {
		
			ok(true, "Identify already loaded stylesheet. It took " + ( new Date().getTime() - time ) + "ms to call back.")
	
			ok(!loaded, "Loaded argument should be false.")
	
			start()
	
		})
	})

	test("hasProtocol test", function() {
	
		var test = {a : function() {}, b : function() {}, c : 123}
		
		expect(2)
		
		equal(util.hasProtocol(test, ['a', 'b']), true, "test object has methods a and b.")
		
		equal(util.hasProtocol(test, ['c']), false, "test object does not implement method c.")
	})
	
	test("hasProperties test", function () {
	
		var test = {a : function() {}, b : function() {}, c : 123}
		
		expect(2)
		
		equal(util.hasProperties(test, ['a', 'b', 'c']), true, "Object has properties a, b and c.")
		
		equal(util.hasProperties(test, ['d', 'e', 'f']), false, "Object does not have properties d, e and f.")
	})
	
	test("addClass, removeClass and hasClass test", function() {
	
		var node = document.createElement('div')
		
		util.addClass(node, 'lala bob')
		
		equal(node.className, "lala bob", "class name should be equal to 'lala bob'.")
		
		ok(util.hasClass(node, 'bob'), "hasClass should be true.")
		
		util.removeClass(node, 'bob')
		
		equal(node.className, "lala", "class name should now equal lala.")
		
		util.removeClass(node, 'lala')
		
		equal(node.className, "", "class name should be empty.")
	})
	
	test("toggleClass test", function() {
	
		var node = document.createElement('div')
		
		expect(2)
	
		util.toggleClass(node, 'someClass')
		
		equal(node.className, 'someClass', "Add class.")
		
		util.toggleClass(node, 'someClass')
		
		equal(node.className, '', "Remove class.")
	})
	
	test("map test", function() {
	
		expect(1)
	
		var a = [1,2,3,4]
		
		var b = util.map(a, function(element) {
		
			return element + 1
		})
		
		equal(b.join(''), [2,3,4,5].join(''), "Increment all items in an array.")
	})
	
	test("htmlEntities test", function() {
	
		expect(1)
	
		var string = "Him & Her. £200. <h1>lala</h1>",
			expected = "Him &#38; Her. &#163;200. &#60;h1&#62;lala&#60;/h1&#62;"
		
		equal(util.htmlEntities(string), expected, "Apply htmlEntities to a string.")
	})
	
	test("getMetaContent test", function() {
	
		expect(1)
	
		util.createElement({
			'tag' : 'meta',
			'attributes' : {
				'name' : 'test',
				'content' : 'something'
			},
			'appendTo' : document.getElementsByTagName('head')[0]
		})
		
		equal(util.getMetaContent('test'), 'something', "Get the contents of a meta tag.")
	})
	
	test("removeNode test", function () {
	
		var node = util.createElement({
			'tag' : 'div',
			'id' : 'testNodeIdentifier',
			'appendTo' : document.body
		})
		
		ok(!!document.getElementById('testNodeIdentifier'), "The node is in the DOM.")
		
		util.removeNode(node)
		
		ok(!document.getElementById('testNodeIdentifier'), "The node has been removed from the DOM.")
	})
	
	test("removeChildren test", function() {
	
		var node = util.createElement({
			'tag' : 'ol',
			'children' : [{
				'tag' : 'li',
				'inner' : 'item 1'
			},{
				'tag' : 'li',
				'inner' : 'item 2'
			},{
				'tag' : 'li',
				'inner' : 'item 3'
			}]
		})
		
		equal(node.childNodes.length, 3, "There are 3 child nodes.")
		
		util.removeChildren(node)
		
		equal(node.childNodes.length, 0, "There are no child nodes.")
	})
	
	test("appendChildren test", function() {
	
		expect(2)
		
		var node = util.createElement({'tag' : 'ol'}),
			children = []
		
		for ( var i = 0; i < 5; i += 1 ) {
			children.push(util.createElement({'tag' : 'li'}))
		}
		
		equal(node.childNodes.length, 0, "The test node has no children.")
		
		util.appendChildren(node, children)
		
		equal(node.childNodes.length, 5, "The test node has 5 children.")
	})
})