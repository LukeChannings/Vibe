define(['lib/md5', 'model.persistence'], function(MD5, Persistence) {

	/**
	 * undo manager constructor.
	 * @param persistence {}
	 * @return {array} current value.
	 */
	var UndoManager = function(persistence) {
	
		this.versions = [[]], // initialise the version to a blank array.
		this.currentVersion = 0 // initially point to the blank version.
		this.store = {}
		this.persistence = false // persistence is off by default.

		var self = this, // alias the instance.
			mutators = ['push', 'splice', 'pop', 'shift', 'unshift', 'reverse', 'sort'],
			array = [] // create the array to be the value.
	
		// apply mutator methods to the instance.
		for ( var i = 0; i < mutators.length; i++ ) {
		
			array[mutators[i]] = (function(mutator) {
			
				return function() {
				
					return self.mutator.call(self, this, arguments, mutator)
				}
				
			})(mutators[i])
		}

		/**
		 * undoes the last mutation on the array.
		 * @param n {number} number of undo operations to perform.
		 */
		array.undo = function(n) {
		
			return self.undoAndRedo.call(this, n, self, false)
		}
		
		/**
		 * redoes the previously undone mutation on the array.
		 * @param n {number} number of redo operations to perform.
		 */
		array.redo = function(n) {
		
			return self.undoAndRedo.call(this, n, self, true)
		}
		
		/**
		 * checks if there is a version behind the current version.
		 * @param n {number} for checking if n undo operations are possible.
		 * @return {bool} true if there is a version, false if not.
		 */
		array.canUndo = function(n) {
		
			return !! self.versions[self.currentVersion - (n || 1)]
		}
		
		/**
		 * checks if there is a version ahead of the current version.
		 * @param n {number} for checking if n redo operations are possible.
		 * @return {bool} true if there is a version, false if not.
		 */
		array.canRedo = function(n) {
		
			return !! self.versions[self.currentVersion + (n || 1)]
		}
		
		/**
		 * enables persistence on the UndoManager instance.
		 * @param store {string} the name of the store to use for persistence.
		 */
		array.withPersistence = function(store) {
			
			var instance = this
			
			self.persistence = new Persistence(store)
				
			var store = self.persistence.load()
			
			if ( store.store && store.versions && store.currentVersion ) {
					
				self.store = store.store
					
				self.versions = store.versions
					
				self.currentVersion = store.currentVersion
					
				Array.prototype.splice.call(instance, 0, instance.length)
					
				Array.prototype.push.apply(instance, self.replaceKeysWithValues(self.versions[self.currentVersion]))
			}
			
			array.clearPersistence = function() {
			
				versions = [[]]; currentVersion = 0
			
				store = {}
			
				this.splice(0, this.length)
			
				self.persistence.clear()
			}
			
			return array
		}
		
		/**
		 * checks if there is a version behind the current version.
		 * @param n {number} for checking if n undo operations are possible.
		 * @return {bool} true if there is a version, false if not.
		 */
		array.canUndo = function(n) {
		
			return !! self.versions[self.currentVersion - (n || 1)]
		}
		
		/**
		 * checks if there is a version ahead of the current version.
		 * @param n {number} for checking if n redo operations are possible.
		 * @return {bool} true if there is a version, false if not.
		 */
		array.canRedo = function(n) {
		
			return !! self.versions[self.currentVersion + (n || 1)]
		}
	
		array.clear = function() {
		
			if ( this.length !== 0 ) {
				self.newVersion()
				
				this.splice(0, this.length)
			}
		}
	
		// return the array.
		return array
	
	}
	
	/**
	 * undoes or redoes the last mutation (if any) performed on the array.
	 * @param n {number} number of undo operations to perform.
	 * @param self {object} the visible array instance.
	 * @param direction {boolean} true for redo, false for undo. 
	 */
	UndoManager.prototype.undoAndRedo = function(n, self, direction) {
		
		// if it is not possible to undo or redo then return false.
		if ( ( direction === true && ! this.canRedo(n) ) || ( direction === false && ! this.canUndo(n) ) ) return false
	
		// set the new version.
		self.currentVersion = direction ? self.currentVersion + (n || 1) : self.currentVersion - (n || 1)
	
		// clear the array instance.
		Array.prototype.splice.call(this, 0, this.length)
	
		var newValue = self.persistence ? self.replaceKeysWithValues(self.versions[self.currentVersion]) : self.versions[self.currentVersion]
	
		if ( self.persistence ) {
			self.persistence.save({
				'versions' : self.versions,
				'currentVersion' : self.currentVersion,
				'store' : self.store
			})
		}
	
		// push the new version onto the array instance.
		return Array.prototype.push.apply(this, newValue)
	}
	
	/**
	 * intercepts mutator methods and creates a new version.
	 * @param context {object} the value instance.
	 * @param arguments {pseudo-array} arguments for the mutator method.
	 * @param method {string} name of the mutator method.
	 * @return the output of the mutator.
	 */
	UndoManager.prototype.mutator = function(context, arguments, method) {
	
		// if there are versions ahead of the current version remove them.
		if ( this.versions.length > this.currentVersion ) this.versions.splice(this.currentVersion + 1)
	
		if ( ! this.anonymousMutation ) {
			// create a new version.
			this.newVersion()
		}
		
		// apply the mutator to the value.
		if ( method != 'sort' ) Array.prototype[method].apply(context, arguments)
		
		// things to do if we're using persistence.
		if ( this.persistence ) {
			
			if ( /^(splice|pop)$/.test(method) ) {
				
				if ( method == 'splice' && arguments.length > 2 ) {
				
					var startIndex = arguments[0],
						itemsToRemove = arguments[1],
						additions = this.replaceValuesWithKeys(Array.prototype.splice.call(arguments, 2, arguments.length))
					
					additions.unshift(startIndex, itemsToRemove)
					
					var result = Array.prototype.splice.apply(this.versions[this.currentVersion], additions)
				} else {
				
					var result = Array.prototype[method].apply(this.versions[this.currentVersion], arguments)
						
					result = this.replaceKeysWithValues(result)
				}
			} else if ( method == 'reverse' ) {
			
				var result = Array.prototype.reverse.apply(this.versions[this.currentVersion])
				
				result = this.replaceKeysWithValues(result)
			} else if ( method == 'sort' ) {
			
				var values = this.replaceKeysWithValues(this.versions[this.currentVersion])
				
				var result = Array.prototype.sort.apply(values, arguments)
				
				Array.prototype.splice.call(context, 0, context.length)
				
				Array.prototype.push.apply(context, values)
				
				this.versions[this.currentVersion] = this.replaceValuesWithKeys(values)
			} else {
			
				// convert the values to keys and apply the mutator.
				var result = Array.prototype[method].apply(this.versions[this.currentVersion], this.replaceValuesWithKeys(arguments))
			}
			
			// update the persistence.
			this.persistence.save({
				'versions' : this.versions,
				'currentVersion' : this.currentVersion,
				'store' : this.store
			})
		}
		
		else {
		
			// apply the mutator to the version.
			var result = Array.prototype[method].apply(this.versions[this.currentVersion], arguments)
		}
		
		return result
	}
	
	/**
	 * transforms an array of values into an array of keys.
	 * @param values {array} to turn into keys.
	 * @return keys {array} array of keys for the values.
	 */
	UndoManager.prototype.replaceValuesWithKeys = function(value) {
	
		var keys = []
	
		for ( var i = 0; i < value.length; i++ ) {
		
			var key = this.generateHash(value[i])
		
			this.store[key] = value[i]
		
			keys.push(key)
		}
		
		return keys
	}
	
	/**
	 * transforms an array of keys to an array of related values.
	 * @param keys {array} of keys.
	 * @return {array} of values.
	 */
	UndoManager.prototype.replaceKeysWithValues = function(keys) {
	
		var values = [],
			keys = keys instanceof Array ? keys : [keys]
	
		for ( var i = 0; i < keys.length; i++ ) {
		
			values[i] = this.store[keys[i]]
		}
		
		return values
	}

	/**
	 * generates a hash for any variable, including objects and arrays.
	 * @param value {generic} value to be hashed.
	 */
	UndoManager.prototype.generateHash = function(value) {

		/**
		 * transforms any variable into a string.
		 * @param value {generic} value to be stringified.
		 */
		var toString = function(value) {
			
			var string = ''
			
			if ( typeof value == 'object' ) {
		
				if ( value instanceof Array ) {
				
					if ( ! /\[object .*?\]/.test(value.join('')) ) return value.join('')
					
					else for ( var i = 0; i < value.length; i++ ) string += i + toString(value[i])
				
				} else {
					for ( var i in value ) string += i + toString(value[i])
				}
				
				return string
			} else if ( !! value ) {
				return value.toString()
			} else {
				return string + value
			}
		}

		// return the hashed stringified variable.
		return MD5(toString(value))
	}
	
	/**
	 * creates a clone of the current branch and sets it up as the new branch.
	 */
	UndoManager.prototype.newVersion = function() {

		// clone the current version.
		var version = (function(currentVersion) {
		
			var fork = []
			
			for ( var i = 0; i < currentVersion.length; i++ ) fork.push(currentVersion[i])

			return fork
		
		})(this.versions[this.currentVersion])
	
		// push the clone into the 
		this.versions.push(version)
		
		// increment the version pointer.
		this.currentVersion++
	}

	return UndoManager
})