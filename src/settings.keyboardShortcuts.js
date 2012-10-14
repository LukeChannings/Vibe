/**
 * default keyboard shortcut settings.
 */
define({
	// space key - toggle play/pause.
	32 : function() {
		this.playerModel.playToggle()
	},

	// up key - turn volume up.
	38 : function() {
		this.playerModel.setVolume(this.playerModel.volume + 10)
	},

	// down key - turn volume down.
	40 : function() {
		this.playerModel.setVolume(this.playerModel.volume - 10)
	}
})