define(['util', 'UI/Widget/TextInput/TextInput', 'dependencies/EventEmitter'], function(util, TextInput, EventEmitter) {

	var UICollectionSearchBar = function(options) {
	
		var options = this.options = options || {}
	
		// check options.
		if ( ! options.appendTo || ! options.apiInstance ) throw util.error('UICollectionSearchBar does not have required parameters.')
	
		var self = this
	
		// create the search bar element.
		var element = this.node = util.createElement({
			'tag' : 'div',
			'customClass' : 'search',
			'appendTo' : options.appendTo
		})

		// create a UITextInputWidget.
		var input = new TextInput({
			appendTo : element,
			placeholder : 'Search the collection.',
			customClass : 'UIWidgetSearchInput search'
		})
		
		// listen for key input.
		input.on('input', self.input.bind(this))
		
		// listen for the input to be cleared.
		input.on('clear', self.clear.bind(this))
		
	}
	
	/**
	 * handle input from the search box.
	 * @param query {string} full query text.
	 * @param key {char} key that was pressed.
	 */
	UICollectionSearchBar.prototype.input = function(query, key) {
	
		var self = this
	
		if ( typeof window.timeout !== 'undefined' )
		{
			clearTimeout(window.timeout)
			window.timeout = undefined
		}
			
		window.timeout = setTimeout(function() {
				
			window.timeout = undefined
				
			// query the api.
			self.options.apiInstance.search(query, function(results) {

				if ( results.length > 0 ) {

					self.emit('results', results)

				}
					
				else {
					
					self.emit('noresults')
					
				}
				
			})
			
		}, 270)
	
	}
	
	UICollectionSearchBar.prototype.clear = function() {
	
		clearTimeout(window.timeout)
						
		window.timeout = undefined
		
		// propagate event upwards.
		this.emit('clear')
	
	}
	
	EventEmitter.augment(UICollectionSearchBar.prototype)
	
	return UICollectionSearchBar

})