//
// unit test for UndoManager.
define(['model.undoManager'], function(UndoManager) {

	module("Undo Manager", {
		setup : function() {
			this.undoManager = new UndoManager()
		},
		teardown : function() {
			this.undoManager = null
		}
	})
	
	test("add items", function() {
	
		this.undoManager.push('1', 1, {'1' : 1})
		
		equal(this.undoManager[0], '1', "zeroth item should be string 1")
		
		equal(this.undoManager[1], 1, "first item should be number 1")
		
		deepEqual(this.undoManager[2], {'1' : 1}, "second item should be object {'1' : 1}")
	})
	
	test("remove items", function() {
	
		this.undoManager.push('1', 1, {'1' : 1})
		
		this.undoManager.splice(0, this.undoManager.length)
		
		equal(this.undoManager.length, 0, "there should be zero items in the array.")
	})
	
	test("undo addition", function () {
	
		this.undoManager.push('1', 1, {'1' : 1})
		
		deepEqual(this.undoManager, ['1', 1, {'1' : 1}], "initial value.")
		
		this.undoManager.undo()
		
		deepEqual(this.undoManager, [], "array should be empty.")
	})
	
	test("undo removal", function() {
	
		this.undoManager.push('1', 1, {'1' : 1})
		
		deepEqual(this.undoManager, ['1', 1, {'1' : 1}], "initial value.")
		
		this.undoManager.splice(1, 2)
		
		deepEqual(this.undoManager, ['1'], "last two elements should be removed.")
		
		this.undoManager.undo()
		
		deepEqual(this.undoManager, ['1', 1, {'1' : 1}], "back to initial value.")
	})
	
	test("redo addition", function() {
	
		this.undoManager.push('1', 1, {'1' : 1})
		
		this.undoManager.undo()
		
		deepEqual(this.undoManager, [], "array should be empty")
		
		this.undoManager.redo()
		
		deepEqual(this.undoManager, ['1', 1, {'1' : 1}], "array should have previous value.")
	})
	
	test("transaction mutations", function() {
	
		this.undoManager.push(1,2,3,4,5,6,7,8,9,10)
		
		deepEqual(this.undoManager, [1,2,3,4,5,6,7,8,9,10], "initial value should be [1,2,3,4,5,6,7,8,9,10].")
		
		this.undoManager.beginTransaction()
		
		for ( var i = this.undoManager.length; i > 5; i-- ) {
			this.undoManager.splice(i, 1)
		}
		
		this.undoManager.endTransaction()
		
		deepEqual(this.undoManager, [1,2,3,4,5,6], "value should be [1,2,3,4,5,6].")
		
		this.undoManager.undo()
		
		deepEqual(this.undoManager, [1,2,3,4,5,6,7,8,9,10], "value should be [1,2,3,4,5,6,7,8,9,10].")
		
		this.undoManager.redo()
		
		deepEqual(this.undoManager, [1,2,3,4,5,6], "value should be [1,2,3,4,5,6].")
	})
})