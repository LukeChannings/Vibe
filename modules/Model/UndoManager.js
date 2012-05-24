/**
 * UndoManager
 * @description acts like an Array but provides methods for undo / redo and has optional persistency.
 */
define(['util','Model/Persistence' ,'dependencies/md5'], function(util, Persistence, MD5) {

	// constructor
	var UndoManager = function(persistenceId) {
		
		var store = {}, // keeps raw values keyed by hashes.
			branches = [[]], // each change to the array creates a new branch.
			currentBranch = 0, // current branch pointer.
			persistence = new Persistence('undoManagerStorage' + persistenceId) // persistence instance.

		var save = function() {
		
			persistence.save({
				store : store,
				branches : branches,
				currentBranch: currentBranch
			})
		
		}

		// set up persistence.
		if ( persistenceId )
		{
			var self = this
		
			// load previous persistence.
			var persistedInstance = persistence.load()
			
			// if there is a previous persistent session.
			if ( persistedInstance )
			{
				store = persistedInstance.store // load the store.
				branches = persistedInstance.branches // load the branches.
				currentBranch = persistedInstance.currentBranch // load the current branch pointer.
			}
			
		}
		
		// utility methods.
		var objectToString = function(object) {
			
			var string
			
			if ( typeof object == 'object' )
			{
			
				for ( var i in object )
				{
					if ( object.hasOwnProperty(i) )
					{
						if ( typeof object[i] == 'string' )
						{
							string += object[i]
						}
						else if ( object[i] == 'object' )
						{
							string += objectToString(object[i])
						}
					}
				}
			
			}
			else if ( typeof object == 'string' || typeof object == 'number')
			{
				string = object
			}
			
			else return undefined
			
			return string
			
		}
		
		var getHash = function(item) {
			
			if (typeof item == 'string')
			{
				return MD5(item)
			}
			else if ( typeof item == 'number' )
			{
				return item
			}
			else if ( typeof item == 'array' )
			{
				var uniqueName
				
				for ( var i = 0; i < item.length; i++ )
				{
					if ( typeof item[i] == 'object' )
					{
						for ( var j in item[i] )
						{
							if ( item[i].hasOwnProperty(j) && typeof item[i][j] == 'string' )
							{
								uniqueName += item[i][j]
							}
						}
					} 
					else if ( typeof item[i] == 'string' ) uniqueName += item[i]
				}
				
				return MD5(uniqueName)
			}
			
		}
		
		// creates a new branch snapshot.
		var fork = function() {
		
			var branch = (function(branch){
				
				var arr = []
				
				for ( var i in branch )
				{
					if ( branch.hasOwnProperty(i) )
					{
						arr.push(branch[i])
					}
				}
				
				return arr
				
			})(branches[currentBranch])
		
			branches.push(branch)
		
			currentBranch++
		}
		
		// undo and redo methods.
		this.undo = function(n) {
		
			if ( typeof n == 'number' )
			{
				if ( typeof branches[currentBranch - n] !== 'undefined')
				{
					currentBranch = currentBranch - n
					
				}
				
			}
			
			else if ( typeof branches[currentBranch - 1] !== 'undefined' ) currentBranch--
		
			save()
		
			return branches[currentBranch].length
		
		}
		
		this.redo = function(n) {
		
			if ( typeof n == 'number' )
			{
				if ( typeof branches[currentBranch + n] !== 'undefined')
				{
					currentBranch = currentBranch + n
					
				}
			}
			
			else if ( typeof branches[currentBranch + 1] !== 'undefined' ) currentBranch++
			
			save()
			
			return branches[currentBranch].length
			
		}
		
		// custom mutator methods.
		this.removeItemsAtIndexes = function() {
		
			fork()
		
			var toRemove = []
		
			for ( var i = 0; i < arguments.length; i++ )
			{
				if ( typeof arguments[i] == 'number' )
				{
					toRemove.push(arguments[i])
				}
			}
			
			toRemove.sort()
			
			for ( var i = toRemove.length; i > 0; i-- )
			{
				branches[currentBranch].splice(toRemove[i], 1)
			}
			
			save()
		}
		
		this.clear = function(purge) {
		
			if ( purge ) {
			
				// set defaults.
				branches = [[]]
				currentBranch = 0
				store = {}
			
				// clear the localStorage.
				delete localStorage['undoManagerStorage' + persistenceId]
			
			}
			
			else {
			
				fork()
				
				branches[currentBranch] = []
				
				save()
			}
		
		}
		
		// array mutator methods:
		this.push = function() {
		
			// check for initial items...
			if ( arguments.length !== 0 )
			{
			
				if ( ( branches.length ) > currentBranch )
				{
					branches.splice(currentBranch + 1, branches.length)
				}
			
				if ( branches.length == 0 )
				{
					fork()
					currentBranch = 0
				}
				else
				{
					fork()
				}
			
				for ( var i = 0; i < arguments.length; i++ )
				{
					var id = getHash(objectToString(arguments[i]))
					
					store[id] = arguments[i]
					
					branches[currentBranch].push(id)
				}
				
			}
		
			save()
		
			return branches[currentBranch].length
		
		}
		
		this.pop = function() {
			
			fork()
			
			var id = branches[currentBranch].pop()
				
			save()
			
			return store[id]
			
		}
		
		this.shift = function() {
		
			fork()
			
			var id = branches[currentBranch].shift()
		
			save()
			
			return store[id]
		
		}
		
		this.reverse = function() {
			
			fork()
			
			branches[currentBranch].reverse()
			
			var result = []
			
			for ( var i in branches[currentBranch] )
			{
				result.push(store[branches[currentBranch][i]])
			}
			
			return result
			
			save()
			
		}
		
		this.splice = function() {
		
			fork()
			
			var removed = Array.prototype.splice.apply(branches[currentBranch],arguments)
		
			for ( var i in removed ) {
				if ( removed.hasOwnProperty(i) )
				{
					removed[i] = store[removed[i]]
				}
			}
			
			save()
			
			return removed
			
		}
		
		this.unshift = function() {
			
			fork()
			
			for ( var i = 0; i < arguments.length; i++ )
			{
				var id = getHash(objectToString(arguments[i]))
				
				store[id] = arguments[i]
				
				branches[currentBranch].unshift(id)
			}
			
			save()
			
			return branches[currentBranch].length
			
		}
		
		// accessor methods:
		this.getItemAtIndex = function(n) {
		
			return store[branches[currentBranch][n]]
		
		}
		
		this.value = function(injectPropertyName) {
			
			var value = []
			
			for ( var i = 0; i < branches[currentBranch].length; i++ )
			{
			
				var item = store[branches[currentBranch][i]]
			
				if ( injectPropertyName ) item.UMPropertyName = branches[currentBranch][i]
			
				value.push(item)
			}
			
			return value
			
		}
		
		this.concat = function() {
			
			// construct current array.
			var currentArray = []
			
			for ( var i in branches[currentBranch] )
			{
				currentArray.push(store(branches[currentBranch]))
			}
			
			return currentArray.concat.apply(this,arguments)
			
		}
		this.join = function() {
		
			// construct current array.
			var currentArray = []
			
			for ( var i in branches[currentBranch] )
			{
				currentArray.push(store(branches[currentBranch]))
			}
			
			return currentArray.concat.join(this,arguments)
		
		}
		this.getBranches = function() { return branches}
		this.getStore = function() { return store }
		
		
		// method to remove unnecessary stored values and branches.
		this.prune = function() {
			
			// prune branches.
			branches.splice(currentBranch + 1, branches.length)
			
			// get all ids used in all trees.
			var allIds = {}
			
			// find unique ids used in branches.
			branches.forEach(function(branch){
			
				branch.forEach(function(id){
					
					allIds[id] = true
					
				})
			
			})
			
			// walk the store.
			for ( var id in store )
			{
				// match ids that are in the store but not the branches.
				if ( ! ( id in allIds ) )
				{
					// remove those ids.
					delete store[id]
				}
			}
			
			save()
			
		}
		
	}
	
	return UndoManager

})