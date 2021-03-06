define(['util'], function(util) {

	/**
	 * module to regulate the use of localStorage.
	 * @param name - Unique identifier for the store.
	 */
	var ModelPersistence = function(name) {
	
		// check for browser support.
		var support = this.support = util.browser.hasSupport.localStorage
	
		this.name = name
	
		// if util returns an it's an exception.
		if ( typeof support === 'object' && ! ModelPersistence.prototype.hasShownError ) {
				
			// require ModalDialogue.
			require(['ui.widget.modalDialogue'], function(modal) {
			
				// create an error dialogue.
				modal.createSingle({
					'title' : 'Error: ' + support.message,
					'body' : '<p>Vibe encountered the following error when attempting to use persistent storage: ' + support.message + '. Additional information: ' + support.name + '</p><p>Please check your security settings regarding localStorage, and if you\'re using FireFox and have your cookie expiation policy set to "Ask every time", set it to "until they expire".</p><p>See this bug for more details: <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=748620">Bug</a></p>',
					'alignment' : 'justify',
					'errorDialogue' : true,
					'buttons' : {Close : function() {
							
						this.close()
					}}
				})
			})
		
			ModelPersistence.prototype.hasShownSecurityError = true
		}
	}
	
	/**
	 * parses the localStorage object that contains the given persistent object.
	 */
	ModelPersistence.prototype.load = function() {
		
		var data = ( this.support === true ) ? localStorage[this.name] : false
		
		if ( data ) {
		
			try {
			
				data = JSON.parse(localStorage[this.name])
			} catch (ex){
			
				data = false
			} finally {
			
				return data
			}
		} else {
			return false
		}
	}
	
	/**
	 * saves a given object to localStorage.
	 * @param set {object} the object to be saved to localStorage.
	 */
	ModelPersistence.prototype.save = function(set) {
	
		if ( typeof set == 'object' && this.support === true ) {
			
			localStorage[this.name] = JSON.stringify(set)
		}
	}
	
	/**
	 * clears the localStorage for the instance.
	 */
	ModelPersistence.prototype.clear = function() {
	
		if ( this.support === true ) {
			delete localStorage[this.name]
		}
	}
	
	ModelPersistence.prototype.hasShownError = false
	
	return ModelPersistence
})