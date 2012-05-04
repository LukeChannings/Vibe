/**
 * MusicMe Playlist
 * @description Provides the Playlist view and mutator methods.
 */
define(['require','util','dependencies/EventEmitter','UI/Widget/ButtonBar/ButtonBar'],function(require, util, EventEmitter, ButtonBar) {

	// register the view stylesheet.
	util.registerStylesheet(require.toUrl('./Playlist.css'));
	
	var initControlBar = function(ButtonBarButtons) {
	
		var controlBar = this.controlBar = util.createElement({ 'tag' : 'div', 'customClass' : 'controlBar', appendTo : this.header });
	
		var self = this;
	
		this.node.addClass('usingControlBar');
	
		var buttons = new ButtonBar({
			appendTo : controlBar,
			buttons : ButtonBarButtons
		});
	
	}

	var initInfoBar = function() {
	
		var infoBar = this.infoBar = util.createElement({ 'tag' : 'div', 'customClass' : 'infoBar', appendTo : this.node });
	
		this.node.addClass('usingInfoBar');
	
	}

	var createPlaylistRow = function(itemDefinition,useColumns) {
	
		var item = util.createElement({ 'tag' : 'ol' });
	
		var columns = {};
	
		for ( var i in itemDefinition )
		{
			var column = document.createElement('li');
			
			if ( i == 'tracklength' && typeof itemDefinition[i] == 'number' ) itemDefinition[i] = util.formatTime(itemDefinition[i]);
			
			column.innerHTML = itemDefinition[i];
			
			column.addClass(i);
			
			columns[i] = column;
		}
	
		if ( useColumns instanceof Array )
		{
			for ( var i = 0; i < useColumns.length; i++ )
			{
				if ( columns[useColumns[i]] ) {
					item.appendChild(columns[useColumns[i]]);
				}
			}
		}
		else
		{
			for ( var i in columns ) item.appendChild(columns[i]);
		}
	
		return item;
	
	}

	var drawLegend = function() {
	
		if ( this.header.children[1] ) this.header.removeChild(this.header.children[1]);
	
		// create the legend.
		var legends = this.legends = {
			albumname: "Album",
			artistname: "Artist",
			trackid: "Id",
			tracklength: "Length",
			trackname: "Track",
			trackno: "#",
			trackof: "# Tracks",
			year: "Year"
		};
	
		var legend = createPlaylistRow(legends, this.options.useColumns);
			
		// add the legend class.
		legend.addClass('legend');
		
		// append the legend to the header.
		this.header.appendChild(legend);
	
	}

	// constructor.
	var UIPlaylist = function(options) {
	
		// check for an options object.
		var options = this.options = ( typeof options == 'object' ) ? options : {};

		this.playingNode = undefined;
		this.selectedNodes = [];

		// set a default useColumns.
		options.useColumns = ( options.useColumns instanceof Array ) ? options.useColumns : ['trackno','trackname','albumname','artistname','tracklength'];

		// create the root UIPlaylist node.
		var node = this.node = util.createElement({
			tag : 'div',
			id : 'UIPlaylist',
			appendTo : ( options.appendTo instanceof Element ) ? options.appendTo : document.body
		});

		// create a node to contain the list legend and optionally the controls bar.
		var header = this.header = util.createElement({'tag' : 'div', 'appendTo' : node});

		// check for useControlBar buttons. If they exist then init the control bar.
		if ( options.useControlBar instanceof Array ) initControlBar.call(this, options.useControlBar);

		// create the legend.
		drawLegend.call(this);

		// define a container for the playlist ordered-list.
		var listContainer = util.createElement({
			'tag' : 'div',
			'customClass' : 'listContainer',
			'appendTo' : node
		});
		
		// create the playlist ordered-list.
		var list = this.list = util.createElement({'tag' : 'ol', 'appendTo' : listContainer});
		
		util.doubleClick(list, function(element) {
		
			console.log(element);
		
		},function(element) {
		
			console.log(element);
		
		});
		
		// include the info bar if the option is specified.
		if ( options.useInfoBar ) initInfoBar.call(this);
	
	}
	
	UIPlaylist.prototype.redraw = function(items, redrawLegend) {
	
		var self = this;
		
		this.list.removeChildren();
		
		if ( redrawLegend ) this.redrawLegend();
		
		console.log(items);
	
	}
	
	UIPlaylist.prototype.redrawLegend = function() {
		
		drawLegend.call(this);
		
	}
	
	
	// use EventEmitter.
	EventEmitter.augment(UIPlaylist.prototype);
		
	// define UIPlaylist module.
	return UIPlaylist;

});