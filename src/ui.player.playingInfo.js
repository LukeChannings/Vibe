//
// shows information on the currently playing track
// including the track name, artist, album and an
// image of the album art.
define(['util'], function(util) {

	var PlayingInfo = function(options) {
	
		if ( util.hasProperties(options, ['appendTo']) ) {
		
			var node = this.node = util.createElement({
				tag : 'div',
				id : 'UIPlayerPlayingInfo',
				appendTo : options.appendTo
			}),
			
			container = util.createElement({
				tag : 'div',
				appendTo : node
			}),
			
			albumArt = util.createElement({
				tag : 'div',
				id : 'albumArt',
				appendTo : container
			}),
			
			info = util.createElement({
				tag : 'div',
				id : 'info',
				appendTo : container
			}),
			
			track = util.createElement({
				tag : 'h1',
				id : 'track',
				appendTo : info
			}),
			
			artist = util.createElement({
				tag : 'h2',
				id : 'artist',
				appendTo : info
			}),
			
			trackNo = util.createElement({
				tag : 'h3',
				id : 'trackNo',
				appendTo : info
			})
			
			this.update = function (metadata) {
			
				util.removeChildren(albumArt)
				
				if ( /^http.*$/.test(metadata.albumart) ) {
					var img = util.createElement({
						tag : 'img',
						attributes : {
							src : metadata.albumart
						},
						appendTo : albumArt
					})
				}
				
				if ( metadata.trackname ) {
				
					track.innerHTML = metadata.trackname
				}
				
				if ( metadata.artistname ) {
				
					artist.innerHTML = metadata.artistname
				}
				
				if ( metadata.trackno ) {
				
					trackNo.innerHTML = metadata.trackno + " of " + metadata.trackof
				}
			}
			
		} else {
			throw new Error("PlayerPlayingInfo was instantiated without the appropriate options.")
		}
	}
	
	return PlayingInfo
})