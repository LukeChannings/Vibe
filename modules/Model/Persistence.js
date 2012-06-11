define(['util/methods'], function(util) {

	/**
	 * Persistence
	 * @description module to regulate the use of localStorage.
	 * @param name - Unique identifier for the store.
	 */
	var ModelPersistence = function(name) {
	
		var support = this.support = util.Browser.HasSupport.localStorage()
	
		this.name = name
	
		// if util returns an object it's an exception.
		if ( typeof support === 'object' && ! ModelPersistence.prototype.hasShownError ) {
				
			// require ModalDialogue.
			require(['UI/Widget/ModalDialogue/ModalDialogue'], function(modal) {
			
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
	
	ModelPersistence.prototype.load = function() {
		
		var data = ( this.support === true ) ? localStorage[this.name] : false
		
		if ( data ) {
		
			try {
			
				data = JSON.parse(localStorage[this.name])
			}
			catch (ex){
			
				data = false
			}
			finally {
			
				return data
			}
		}
		
		else return false
	}
	
	ModelPersistence.prototype.save = function(set) {
	
		if ( typeof set == 'object' && this.support === true ) {
			
			localStorage[this.name] = JSON.stringify(set)
			
		}
	}
	
	ModelPersistence.prototype.clear = function() {
	
		if ( this.support === true ) delete localStorage[this.name]
	
	}
	
	ModelPersistence.prototype.hasShownError = false
	
	return ModelPersistence

})