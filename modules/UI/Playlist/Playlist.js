/**
 * MusicMe Playlist
 * @description Provides the Playlist view and mutator methods.
 */
define(['require','util','dependencies/EventEmitter'],function(require, util, EventEmitter){

	// register the view stylesheet.
	util.registerStylesheet(require.toUrl('./Playlist.css'));
	
	// constructor.
	var UIPlaylist = function(options) {
	
		// check for options.
		if ( typeof options !== 'object' ) options = {};
	
		// determine the parent node.
		var parentNode = this.parentNode = ( options.appendTo instanceof Element ) ? options.appendTo : document.body;
	
		// create the UIPlaylist node.
		var node = this.node = util.createElement({tag : 'div', id : 'UIPlaylist', appendTo : parentNode});
	
		// set the column definition.
		var columns = this.columns = ['trackno','trackname','albumname','artistname','tracklength'];
	
		if ( options.usingControlBar )
		{
			initControlBar.call(this);
		}
	
		// create the legend.
		var legend = createItemNode({trackno : '#', title : 'Name', artist : 'Artist', album : 'Album', length : 'Length'});
		
		legend.addClass('legend');
		
		if ( options.usingInfoBar )
		{
			initInfoBar.call(this);
		}
	
	}
	
	// use EventEmitter.
	EventEmitter.augment(UIPlaylist.prototype);
	
	/**
	 * createItemNode
	 * @description creates an HTMLLIElement that represents each property of the item as a column.
	 * @param item (object) - playlistModel item object.
	 * @param useColumns (array) - list of columns to use. (If undefined, all columns are used.)
	 * @param index (int) - the index of the item in the model array.
	 */
	var createItemNode = function(item,useColumns,index) {
	
		if ( typeof item == 'object' )
		{
			var rowContainer = util.createElement({tag : 'li', children : [{tag : 'ol'}]});
			
			var row = rowContainer.getElementsByTagName('ol')[0];
			
			var columns = {};
			
			for ( var i in item )
			{
				var column = document.createElement('li');
				
				if ( i == 'tracklength' && typeof item[i] == 'number' )
				{
					item[i] = util.formatTime(item[i]);
				}
				
				column.innerHTML = ( item[i] !== undefined && item[i] !== null ) ? item[i] : '&nbsp;';
				
				column.addClass(i);
				
				columns[i] = column;
				
			}
			
			if ( useColumns instanceof Array )
			{
				
				useColumns.forEach(function(columnName){
				
					if ( columns[columnName] )
					{
						row.appendChild(columns[columnName]);
					}
					else
					{
						console.warn(columnName + " does not exist.");
					}
				});
				
			}
			else
			{
				for ( var i in columns )
				{
					row.appendChild(columns[i]);
				}
			}
			
			return rowContainer;
			
		}
	
	}
	
	/**
	 * redraw
	 * @description redraws the playlist.
	 * @param items (array) - list of playlist item objects.
	 */
	UIPlaylist.prototype.redraw = function(items) {
	
		var self = this;
	
		self.node.removeChildren();
	
		items.forEach(function(item){
		
			var node = createItemNode(item,self.columns);
			
			self.node.appendChild(node);
		
		});
		
		self.node.scrollTop = self.node.scrollHeight
	
	}
	
	/**
	 * add
	 * @description creates a playlist item from an object and inserts that object into the playlist.
	 */
	UIPlaylist.prototype.add = function(item) {
	
		var node = createItemNode(item,this.columns);
		
		this.node.appendChild(node);
	
	}
	
	// define UIPlaylist module.
	return UIPlaylist;

});