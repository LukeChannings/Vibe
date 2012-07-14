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

			track = util.createElement({
				tag : 'h1',
				id : 'track',
				appendTo : node
			}),
			
			artist = util.createElement({
				tag : 'h2',
				id : 'artist',
				appendTo : node
			}),
			
			trackNo = util.createElement({
				tag : 'h3',
				id : 'trackNo',
				appendTo : node
			})
			
			this.update = function (metadata) {
			
				if ( metadata ) {
				
					util.addClass(node, 'visible')
				
				} else {
				
					util.removeClass(node, 'visible')
					
					return
				}
			
				if ( metadata.trackname ) {
				
					track.innerHTML = metadata.trackname
				}
				
				if ( metadata.artistname ) {
				
					artist.innerHTML = metadata.artistname
				}
				
				if ( metadata.trackno ) {
				
					trackNo.innerHTML = metadata.albumname
				}
			}
			
		} else {
			throw new Error("PlayerPlayingInfo was instantiated without the appropriate options.")
		}
	}
	
	return PlayingInfo
})