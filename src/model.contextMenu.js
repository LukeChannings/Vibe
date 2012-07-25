//
// Context Menus
// an interface with which to get a Context Menu definition
// for a given context. methods for creating contexts are
// also exposed.
define(['util'], function(util) {

	var ContextMenuModel = function() {
	
		// a context is a unique identifier for a
		// single context menu, the identifier is the
		// key, and the context menu is an array of 
		// items as a value.
		var contexts = []
		
		// creates a new context.
		// @param identifier {string} name of the context, e.g. the name of the element in which the menu will be used.
		// @param items {Array} a list of items for the context menu.
		this.addContext = function(identifier, items) {
		
			// ensure the identifier is valid.
			if ( typeof identifier !== 'string' ) {
				return false
			}
			
			// ensure the context does not already exist.
			if ( contexts[identifier] ) {
				return false
			}
			
			// ensure items are valid if they exist.
			if ( items && ! this.contextItemsAreValid(items) ) {
				return false
			}
			
			// create the context.
			contexts[identifier] = ( util.isArray(items) ) ? items : []
			
			// return true on success.
			return true
		}
		
		// appends an item to a pre-existing context.
		// @param identifier {string} name of the context.
		// @param item {object} the item object.
		this.addContextItem = function(identifier, item) {
		
			if ( typeof identifier == 'string' && contexts[identifier] && this.contextItemsAreValid([item]) ) {
				
				contexts[identifier].push(item)
				return true
			} else {
				return false
			}
		}
		
		// returns the items for a given context.
		// @param identifier {string} the name of the context.
		this.getContext = function(identifier) {
		
			if ( contexts[identifier] ) {
				return contexts[identifier]
			} else {
				return false
			}
		}
		
		// removes a context.
		// @param identifier {string} the name of the context.
		this.removeContext = function(identifier) {
		
			if ( contexts[identifier] ) {
				delete contexts[identifier]
				return true
			} else {
				return false
			}
		}
		
		// removes an items from a given context.
		// @param identifier {string} name of the context.
		// @param item {object} the item object.
		this.removeContextItem = function(identifier, item) {
		
			if ( contexts[identifier] ) {
				
				var index = contexts[identifier].indexOf(item)
				
				if ( index !== -1 ) {
					
					contexts[identifier].splice(index, 1)
					
					return true
					
				} else {
					return false
				}
				
			} else {
				return false
			}
		}
	
		// determines if a set of items are valid.
		// @param items {Array} the items list to check.
		// @return {bool} true if the items are valid, otherwise false.
		this.contextItemsAreValid = function(items) {
	
			if ( ! util.isArray(items) ) {
				return false
			}
			
			for ( var i = 0; i < items.length; i += 1 ) {
			
				if ( typeof items[i] !== 'object' ) {
					return false
				} else {
				
					if ( typeof items[i].title === 'string' && typeof items[i].callback === 'function' ) {
						return true
					} else {
						return false
					}
				}
			}
		}
	}

	return ContextMenuModel
})