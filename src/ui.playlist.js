/**
 * provides the Playlist view and mutator methods.
 */
define(function(require) {

	// dependencies.
	var util = require('util'),
		RearrangeableList = require('ui.widget.rearrangeableList'),
		PlaylistRow = require('ui.playlist.row'),
		PlaylistLegend = require('ui.playlist.legend'),
		PlaylistControlBar = require('ui.playlist.controlBar'),
		PlaylistInfoBar = require('ui.playlist.infoBar')	
	
	//
	// creates an instance of Playlist.
	// @param options {object} an object for configuring the instance.
	//
	var Playlist = function (options) {
	
		var options = this.options = (typeof options == 'object') ? options : {},
			self = this
	
		util.registerStylesheet('./stylesheets/ui.playlist.css', function () {
		
			// define columns to use.
			self.columns = options.hasOwnProperty('useColumns') ? options.useColumns : ['trackno','trackname','albumname','artistname','tracklength']
			
			// create the root playlist element node.
			var node = self.node = util.createElement({
				tag : 'div',
				id : 'UIPlaylist'
			})
			
			// create the header.
			var header = self.header = util.createElement({
				tag : 'div',
				appendTo : node
			})

			var control = self.control = PlaylistControlBar.call(self, options.withControlBarButtons)
			
			var legend = new PlaylistLegend(header).withColumns(self.columns)
			
			var listContainer = self.listContainer = util.createElement({
				'tag' : 'div',
				'customClass' : 'listContainer',
				'appendTo' : node
			})
			
			var list = self.list = new RearrangeableList({
				appendTo : listContainer,
				onbeforemove : playlistItemWillMove,
				onaftermove : playlistItemDidMove,
				onremove : playlistItemWasRemoved
			})
			
			// make an info bar instance.
			self.infoBar = new PlaylistInfoBar(self.node)
			
			function playlistItemWillMove(from, to, insertDirection) {

				var model = self.super.playlistModel.model

				model.anonymousMutation = true

				if ( insertDirection == 'before' ) {
				
					model.splice(to - 1, 0, model.splice(from, 1)[0])
				} else {
				
					model.splice(to, 0, model.splice(from, 1)[0])
				}
				
				delete model.anonymousMutation
			}
			
			function playlistItemDidMove() {
			
				if ( self.playingNode ) {
				
					self.super.playlistModel.index = util.indexOfNode(
						self.playingNode
					)
				}
			}
			
			function playlistItemWasRemoved() {
			
				console.log("An item was removed.")
			}

			if ( self.options.onload ) {
				self.options.onload(self)
			}
		})
	}
	
	//
	// adds item rows to the playlist.
	// @param items {Array} a list of playlist items.
	// @param afterItem {Element} (optional) insert new items after the reference row.
	//
	Playlist.prototype.addRows = function(items, afterItem) {
	
		var self = this
		
		var rows = util.map(items, function(item) {
		
			var row = new PlaylistRow(item).withColumns(self.columns)
		
			if ( self.options.onplayitem ) {
				row.onplayitem = function(e, row) {
					self.options.onplayitem(row)
				}
			}
			
			return row.node
		})
	
		this.list.addNodes(rows, afterItem)
		
		if ( self.options.onchange ) {
			self.options.onchange()
		}
	}
	
	//
	// redraws the playlist from a list of reference nodes.
	// @param items {Array} list of playlist items.
	//
	Playlist.prototype.redraw = function(items) {
	
		if ( this.list ) {
	
			// empty playlist UI.
			this.list.removeChildren()
			
			// add the items.
			this.addRows(items)
			
			if ( this.options.onchange ) {
				this.options.onchange()
			}
		}
	}
	
	return Playlist
})