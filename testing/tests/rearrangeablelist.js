define(['util'], function(util) {

	module("rearrangeable list model")
	
	test("test index translation.", function() {

		// initial array.
		var arr = ["a", "b", "c", "d", "e", "f"]
		
		util.translateObjectProperties(arr, [3, 4, 5], 0)
	
		deepEqual(arr, ["d", "e", "f", "a", "b", "c"], "should be [d, e, f, a, b, c]")
		
		util.translateObjectProperties(arr, [2, 3, 4, 5], 0)
		
		deepEqual(arr, ["f", "a", "b", "c", "d", "e"], "should be [f, a, b, c, d, e]")
		
		util.translateObjectProperties(arr, [0], arr.length)
		
		deepEqual(arr, ["a", "b", "c", "d", "e", "f"], "should be [a, b, c, d, e, f]")
		
		util.translateObjectProperties(arr, [0, 1, 2, 3, 4, 5], 0, true)
		
		deepEqual(arr, ["f", "e", "d", "c", "b", "a"], "should be [f, e, d, c, b, a]")
	})
	
	test("insertion point test", function() {
	
		var insert = function(array, item, insertionIndex, insertBefore) {
		
			if ( insertBefore ) {
				insertionIndex -= 1
			}
			
			array.splice(insertionIndex, 0, item)
		}
	
		var insertGroup = function(array, items, insertionIndex, insertBefore) {
		
			for ( var i = 0; i < items.length; i += 1 ) {
			
				insert(
					array,
					items[i],
					insertionIndex + i,
					insertBefore
				)
			}
		}
	
		var arr = ["a", "b", "c", "d", "e"]
		
		insert(arr, "z", 3)
		
		deepEqual(arr, ["a", "b", "c", "z", "d", "e"], "should be [a, b, c, z, d, e]")
		
		insertGroup(arr, ["h", "i", "j"], 4)
		
		deepEqual(arr, ["a", "b", "c", "z", "h", "i", "j", "d", "e"], "should be [a, b, c, z, h, i, j, d, e]")
	})

	module("rearrangeable list view", {
		setup : function() {
		
			this.node = document.createElement('ol')
			
			for ( var i = 1; i <= 10; i += 1 ) {
			
				this["item" + i] = document.createElement('li')
				
				this["item" + i].innerHTML = "item " + i
				
				this.node.appendChild(this["item" + i])
			}
		}
	})
	
	test("translate a group of nodes", function() {
	
		util.translateNodePositions(
			this.node,
			[this.item5, this.item6, this.item7, this.item8],
			this.item1
		)
		
		expect(5)
		
		equal(this.node.childNodes[0].innerHTML, "item 5", "first item should be item 5.")
		equal(this.node.childNodes[1].innerHTML, "item 6", "second item should be item 6.")
		equal(this.node.childNodes[2].innerHTML, "item 7", "third item should be item 7.")
		equal(this.node.childNodes[3].innerHTML, "item 8", "fourth item should be item 8.")
		equal(this.node.childNodes[4].innerHTML, "item 1", "fifth item should be item 1.")
	})

	test("translate four random nodes", function() {
	
		var random = [],
			index = Math.round(Math.random() * 9)
		
		for ( var i = 0; i < 4; i += 1 ) {
		
			var item
		
			do {
			
				item = Math.round(Math.random() * 9)
				
			} while ( random.indexOf(item) !== -1 && item !== index )
		
			random.push(item)
		}
		
		util.translateNodePositions(
			this.node,
			random,
			index
		)
		
		equal(this.node.childNodes[index].innerHTML, "item " + (random[0] - 1), "item " + index + " should equal " + (random[0] - 1))
		equal(this.node.childNodes[index + 1].innerHTML, "item " + (random[1] - 1), "item " + (index + 1) + " should equal " + (random[1] - 1))
	})
})