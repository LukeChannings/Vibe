define(['util'], function(util) {

	/**
	 * creates a legend container and appends it to the element.
	 * @param appendTo {HTMLElement} element to append the legend to.
	 */
	var UIPlaylistLegend = function(appendTo) {
	
		// create the container.
		var legend = this.legend = util.createElement({
			tag : 'ol',
			appendTo : appendTo,
			customClass : 'legend'
		})
	
		var columns = this.columns = {};
	
		columns.albumname = 'Album'
		columns.artistname = 'Artist'
		columns.trackid = 'ID'
		columns.tracklength = 'Length'
		columns.trackname = 'Track'
		columns.trackno = '#'
		columns.trackof = 'Of'
		
		// create legend nodes for every possible column.
		for ( var i in columns ) {
		
			var column = document.createElement('li')
		
			column.innerHTML = columns[i]
			
			column.className = i
		
			util.disableUserSelect(column)
		
			columns[i] = column
		}
	}
	
	/**
	 * uses the columns defined by a list of names.
	 * @param useColumns {array} list of column names.
	 */
	UIPlaylistLegend.prototype.withColumns = function(useColumns) {
	
		var self = this
	
		if ( util.isArray(useColumns) ) {
		
			util.removeChildren(self.legend)
		
			util.forEach(useColumns, function(column) {
			
				if ( typeof self.columns[column] !== 'undefined' ) {
					
					self.legend.appendChild(self.columns[column])
				}
			})
		}
	}

	return UIPlaylistLegend
})