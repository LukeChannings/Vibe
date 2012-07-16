define(function(require) {

	// dependencies.
	var util = require('util'),
		DragDealer = require('lib/DragDealer')

	/**
	 * constructs a slider instance.
	 * @param options {object} options with which to initialise the instance.
	 */
	var UIPlayerSlider = function(options) {
	
		// default options to an object.
		var options = options || {},
		
		self = this,
		
		// container node for the slider and 
		node = util.createElement({
			'tag' : 'div',
			'id' : 'UIPlayerSlider',
			'appendTo' : options.appendTo || document.body,
			'children' : [{
				'tag' : 'li',
				'customClass' : 'current_time'},{
				'tag' : 'li',
				'customClass' : 'slider'},{
				'tag' : 'li',
				'customClass' : 'total_time'
			}]
		}),
	
		// contains the slider. (handle, progress and buffer.)
		slider = util.createElement({
			'tag' : 'div',
			'customClass' : 'dragdealer',
			'appendTo' : node.getElementsByTagName('li')[1]
		}),
	
		// handle for seeking.
		handle = util.createElement({
			'tag' : 'div',
			'customClass' : 'handle',
			'appendTo' : slider
		}),
	
		// shows the playing progress.
		progress = util.createElement({
			'tag' : 'div',
			'customClass' : 'progress',
			'appendTo' : slider
		}),
		
		// shows the amount of the track that has buffered.
		buffer = util.createElement({
			'tag' : 'div',
			'customClass' : 'buffer',
			'appendTo' : slider
		}),
	
		// shows the current track time in '00:00' format.
		currentTime = this.currentTime = util.createElement({
			'tag' : 'span',
			'inner' : '00:00',
			'appendTo' : node.getElementsByTagName('li')[0]
		}),
		
		// shows the duration of the track in '00:00' format.
		totalTime = this.totalTime = util.createElement({
			'tag' : 'span',
			'inner' : '00:00',
			'appendTo' : node.getElementsByTagName('li')[2]
		}),
	
		// dragdealer instance. (actually makes the slider work, because bloody nothing except webkit supports the range input.)
		dragdealer = new DragDealer(slider, {
			'slide' : false,
			'speed' : 100,
			// emit the seek event when the slider value changes.
			'callback' : options.onseek
		})
		
		// disable selection of time info.
		util.disableUserSelect(currentTime)
		util.disableUserSelect(totalTime)
		
		/**
		 * updates the slider progress and time.
		 * @param position {number} slider position.
		 * @param time {number} current track time in seconds.
		 */
		this.updateProgress = function(position, time) {

			dragdealer.setValue(position)
			
			if ( position === 0 ) {
				progress.style.width = 0
			} else {
				progress.style.width = handle.style.left	
			}
			
			currentTime.innerHTML = util.formatTime(time)
		}
		
		/**
		 * updates the indicator of how much the track has buffered.
		 * @param buffered {number} percentage of the track that has buffered.
		 */
		this.updateBuffer = function(buffered) {
		
			buffer.style.width = buffered + '%'
		}
	
		/**
		 * updates the indicator for the total duration of the track.
		 * @param duration {number} duration of the track in seconds.
		 */
		this.updateDuration = function(duration) {
		
			totalTime.innerHTML = util.formatTime(duration)
		}
		
		// disables the slider.
		this.disable = function() {
		
			dragdealer.disable()
		}
	
		// enables the slider.
		this.enable = function() {
		
			dragdealer.enable()
		}
	}

	return UIPlayerSlider
})