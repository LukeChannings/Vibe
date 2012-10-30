define(function(require) {

	var util = require('util')

	return {
	
		//
		// presents a notification dialogue.
		// @param metadata {object} the track metadata object.
		presentNotificationWithMetadata : function(metadata) {
		
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

				if ( metadata.art ) {
					url += "albumArt=" + metadata.art.medium
				}
				
				notification = window.webkitNotifications.createHTMLNotification(url)
				
			} else if ( window.webkitNotifications.createNotification ) {
			
				notification = window.webkitNotifications.createNotification(
					  metadata.art ? metadata.art.medium : ""
					, "Playing " + metadata.trackname + " by " + metadata.artistname
					, "Track " + metadata.trackno + " of " + metadata.trackof
				)
				
			} else {
				throw new Error("Webkit Notifications are not available.")
			}
			
			notification.show()
			
			setTimeout(function () {
			
				notification.abort && notification.abort()
			
				notification.close && notification.close()
			
			}, 7000)
		},
		
		//
		// adds the webkit notification preference to the User Interface settings pane.
		// @param settingsAssistant {object} the SettingsAssistant instance.
		addPreferenceInput : function(settingsAssistant) {
		
			settingsAssistant.appendInput(
				"interface",
				function() {
					return {
						name : 'notifications',
						title : 'Desktop Notifications',
						type : 'checkbox',
						checked : settingsAssistant.settings.get('notifications'),
						support : /Webkit/i
					}
				},
				
				function(inputs) {
				
					if ( inputs.notifications.checked ) {
					
						if (window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {
							
							window.webkitNotifications.requestPermission(function() {
							
								settingsAssistant.settings.set('notifications', true)
							})
							
						} else {
							settingsAssistant.settings.set('notifications', true)
						}
						
					} else {
						settingsAssistant.settings.set('notifications', false)
					}
				}
			
			)
		}
	}
})