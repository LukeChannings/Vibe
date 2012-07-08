define(function(require) {

	var util = require('util')

	return {
		showNotificationWithMetadata : function(metadata) {
		
			var notification
		
			if ( window.webkitNotifications.createHTMLNotification ) {
			
				var url = "src/api.webkitNotifications.notification.html?"

				if ( metadata.trackname ) {
					url += "track=" + encodeURIComponent(metadata.trackname) + "&"
				}

				if ( metadata.artistname ) {
					url += "artist=" + encodeURIComponent(metadata.artistname) + "&"
				}

				if ( metadata.trackno ) {
					url += "trackNo=" + encodeURIComponent(metadata.trackno + " of " + metadata.trackof) + "&"
				}
				
				if ( metadata.tracklength ) {
					url += "trackDuration=" + encodeURIComponent(util.expandTime(metadata.tracklength)) + "&"
				}
				
				if ( metadata.albumart ) {
					url += "albumArt=" + metadata.albumart
				}
				
				notification = window.webkitNotifications.createHTMLNotification(url)
				
			} else if ( window.webkitNotifications.createNotification ) {
			
				notification = window.webkitNotifications.createNotification(
					metadata.albumart,
					"Playing " + metadata.trackname + " by " + metadata.artistname,
					"Track " + metadata.trackno + " of " + metadata.trackof + ". Duration " + util.expandTime(metadata.tracklength)
				)
				
			}
			
			notification.show()
			
			setTimeout(function () {
			
				notification.abort && notification.abort()
			
				notification.close && notification.close()
			
			}, 7000)
		}
	}
})