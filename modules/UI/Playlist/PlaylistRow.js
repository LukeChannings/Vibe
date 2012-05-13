define(['util'], function(util) {

	/**
	 * represents a playlist row.
	 * @param definition {object} defines a playlist row.
	 */
	var UIPlaylistRow = function(definition) {
	
		var self = this
	
		// define the playlist row.
		var row = this.row = util.createElement({ 'tag' : 'li', 'appendTo' : definition.appendTo })
	
		// define a container for the columns.
		var columnContainer = this.columnContainer = util.createElement({'tag' : 'ol', 'appendTo' : row})
		
		// create an array to contain the columns.
		var columns = this.columns = {}
	
		this.id = definition.trackid
		
		// create columns.
		for ( var i in definition ) {
		
			if ( definition.hasOwnProperty(i) ) {
			
				var column = document.createElement('li')
				
				util.disableUserSelect(column)
				
				column.innerHTML = ( i == 'tracklength' ) ? util.formatTime(definition[i]) : definition[i]
				
				column.className = i
				
				columns[i] = column
			
			}
		
		}
		
		util.addListener(columnContainer, 'click', (function(instance) {
	
			return function(e) {
			
				self.click(e, instance)
			
			}
		
		})(this))
	
	}
	
	/**
	 * uses the specified columns by order of name. clears the row before appending.
	 * @param columns {array} list of column names.
	 */
	UIPlaylistRow.prototype.withColumns = function(columns) {
	
		var self = this
	
		if ( columns instanceof Array ) {
		
			self.columnContainer.removeChildren()
		
			columns.forEach(function(columnName) {
			
				if ( self.columns[columnName] instanceof Element ) {
			
					self.columnContainer.appendChild(self.columns[columnName])
				}
			
			})
		
		}
		
		else return false
	
		return this
	
	}
	
	/**
	 * handles the click event on a playlist row.
	 * @param e {object} the event object.
	 * @param item {object} the UIPlaylistRow instance associated with this row.
	 */
	UIPlaylistRow.prototype.click = function(e, item) {
	
		item.row.addClass('selected')
	
	}
	
	/**
	 * checks that an object defines the minimum properties to conform to a UIPlaylistRow specification.
	 * @param definition {object} the definition of the row.
	 */
	UIPlaylistRow.isValidDefinition = function(definition) {
	
		if ( typeof definition == 'object' ) {
			
			if ( typeof definition.albumname != 'string' || typeof definition.artistname != 'string' ) return false;
				
			else if ( typeof definition.trackid !== 'string' || typeof definition.trackname !== 'string' ) return false;
				
		}
			
		else return false
		
		return true
	
	}
	
	return UIPlaylistRow

})