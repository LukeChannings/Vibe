define(function(require) {

	// dependencies.
	var util = require('util'),
		TextInput = require('ui.widget.textInput')

	var UICollectionSearchBar = function(options) {
	
		var options = this.options = options || {}
	
		// check options.
		if ( ! options.appendTo || ! options.apiInstance ) {
			throw new Error('UICollectionSearchBar does not have required parameters.')
		}
	
		var self = this,
	
		// create the search bar element.
		element = this.node = util.createElement({
			'tag' : 'div',
			'customClass' : 'search',
			'appendTo' : options.appendTo
		}),

		// create a UITextInputWidget.
		input = new TextInput({
			appendTo : element,
			placeholder : 'Search the collection.',
			customClass : 'UIWidgetSearchInput search',
			oninput : function() {
			
				self.input()
			},
			onclear : function() {
			
				self.clear()
			}
		})
	}
	
	/**
	 * handle input from the search box.
	 * @param query {string} full query text.
	 * @param key {char} key that was pressed.
	 */
	UICollectionSearchBar.prototype.input = function(query, key) {
	
		var self = this
	
		if ( typeof window.timeout !== 'undefined' ) {
			clearTimeout(window.timeout)
			window.timeout = undefined
		}
			
		window.timeout = setTimeout(function() {
				
			window.timeout = undefined
			
			// query the api.
			self.options.apiInstance.search(query, function(results) {

				if ( results.length > 0 ) {

					if ( self.options.onresult ) {
						self.options.onresult(results)
					}
				} else {
					
					if ( self.options.onnoresult ) {
						self.options.onnoresult()
					}
				}
			})
			
		}, 270)
	}
	
	UICollectionSearchBar.prototype.clear = function() {
	
		clearTimeout(window.timeout)
						
		window.timeout = undefined
		
		if ( self.options.onclear ) {
			self.options.onclear()
		}
	}

	return UICollectionSearchBar
})