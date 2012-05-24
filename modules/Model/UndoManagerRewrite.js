/**
 * UndoManager
 * @description acts like an Array but provides methods for undo / redo and has optional persistency.
 */
define(function() {

	/**
	 * undo manager constructor.
	 * @param persistence {}
	 * @return {array} current value.
	 */
	var UndoManager = function(persistence) {
	
		this.versions = [[]], // initialise the version to a blank array.
		this.currentVersion = 0 // initially point to the blank version.
	
		var self = this, // alias the instance.
			value = [] // create the array to be the value.
	
		window.instance = this
	
		// mutator hooks.
		value.push = function() { return self.mutator.call(self, this, arguments, 'push') }
		value.splice = function() { return self.mutator.call(self, this, arguments, 'splice') }
		value.pop = function() { return self.mutator.call(self, this, arguments, 'pop') }
		value.shift = function() { return self.mutator.call(self, this, arguments, 'shift') }
		value.unshift = function() { return self.mutator.call(self, this, arguments, 'unshift') }
		
		/**
		 * undoes the last mutation (if any) performed on the array.
		 */
		value.undo = function() {
		
			if ( this.canUndo() ) {
			
				self.currentVersion--
				
				 Array.prototype.splice.call(this, 0, this.length)
				
				return  Array.prototype.push.apply(this, self.versions[self.currentVersion])
			
			}
			
			else return false
		}
		
		/**
		 * redoes the previously undone mutation on the array.
		 */
		value.redo = function() {
		
			if ( this.canRedo() ) {
			
				self.currentVersion++
			
				 Array.prototype.splice.call(this, 0, this.length)
				
				return  Array.prototype.push.apply(this, self.versions[self.currentVersion])
			}
			
			else return false
		}
		
		/**
		 * checks if there is a version behind the current version.
		 * @return {bool} true if there is a version, false if not.
		 */
		value.canUndo = function() {
		
			return !! self.versions[self.currentVersion - 1]
		
		}
		
		/**
		 * checks if there is a version ahead of the current version.
		 * @return {bool} true if there is a version, false if not.
		 */
		value.canRedo = function() {
		
			return !! self.versions[self.currentVersion + 1]
		
		}
	
		// return the array.
		return value
	
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
	
		// create a new version.
		this.newVersion()
		
		// apply the mutator to the value.
		Array.prototype[method].apply(context, arguments)
		
		// apply the mutator to the version.
		return Array.prototype[method].apply(this.versions[this.currentVersion], arguments)
	
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