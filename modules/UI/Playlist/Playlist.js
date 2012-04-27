/**
 * MusicMe Playlist
 * @description Provides the Playlist view and mutator methods.
 */
define(['require','util','dependencies/EventEmitter'],function(require, util, EventEmitter){

	// register the view stylesheet.
	util.registerStylesheet(require.toUrl('./Playlist.css'));
	
	// constructor.
	var UIPlaylist = function(options) {
	
		// make sure options exists.
		var option = this.options = ( typeof options == 'object' ) ? options : {};
	
		var node = this.node = util.createElement({ 'tag' : 'div', 'id' : 'UIPlaylist', appendTo : options.appendTo || document.body });
	
		// use the control bar if needed.
		if ( options.useControlBar ) initControlBar.call(this);
		
		// define the list container.
		var listContainer = util.createElement({
			'tag' : 'div',
			'customClass' : 'listContainer',
			'appendTo' : node
		});
		
		var list = this.list = util.createElement({'tag' : 'ol', 'appendTo' : listContainer});
		
		// use the info bar if needed.
		if ( options.useInfoBar ) initInfoBar.call(this);
	
	}
	
	var initControlBar = function() {
	
		var controlBar = this.controlBar = util.createElement({ 'tag' : 'div', 'customClass' : 'controlBar', appendTo : this.node });
	
		this.node.addClass('usingControlBar');
	
	}
	var initInfoBar = function() {
	
		var infoBar = this.infoBar = util.createElement({ 'tag' : 'div', 'customClass' : 'infoBar', appendTo : this.node });
	
		this.node.addClass('usingInfoBar');
	
	}
	
	var createPlaylistRow = function(itemDefinition, columnsToUse) {
	
		var item = util.createElement({ 'tag' : 'ol' });
	
		var columns = {};
	
		for ( var i in itemDefinition )
		{
			var column = document.createElement('li');
			column.innerHTML = itemDefinition[i];
			column.addClass(i);
			columns[i] = column;
		}
	
		item.appendChildren([columns.trackname, columns.trackno, columns.albumname, columns.artistname]);
	
		return item;
	
	}
	
	UIPlaylist.prototype.redraw = function(items) {
	
		var self = this;
	
		var columns = ( this.options.columns instanceof Array ) ? this.options.columns : ['trackname','trackno','albumname','artistname'];
	
		items.forEach(function(item){
		
			var node = util.createElement({'tag' : 'li', appendTo : self.list});
		
			var row = createPlaylistRow(item,columns);
		
			node.appendChild(row);
		
		});
	
	}
	
	// use EventEmitter.
	EventEmitter.augment(UIPlaylist.prototype);
		
	// define UIPlaylist module.
	return UIPlaylist;

});