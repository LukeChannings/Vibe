/**
 * ModalDialogue
 * @description Provides functionality for dynamically constructing modal dialogues.
 * @method createSingle - Method for creating a simple dialogue.
 * @method createWizard - Method for creating a dialogue with multiple panes.
 * @method createMultiView - Method for creating a view-based dialogue with sidebar navigation.
 * @dependencies - modules/util, modal.css, modal.mobile.css (For mobile.)
 */
define(['require','util'],function(require, util){

	/**
	 * Stylesheet injection.
	 */
	util.registerStylesheet(require.toUrl('./ModalDialogue.css'))
	
	// mobile stylesheet.
	if ( util.Browser.isMobile() ) util.registerStylesheet(require.toUrl('./ModalDialogue.mobile.css'))

	// the overlay upon which the dialogue is appended.
	var overlay = ( document.getElementById('ModalDialogueOverlay') ) ?  document.getElementById('ModalDialogueOverlay') : util.createElement({'tag' : 'div', 'id' : 'ModalDialogueOverlay', appendTo : document.body}),
		currentDialogue = null, // the current visible dialogue.
		Animator, // animator class for animating the presentation and dismissal of elements.
		AnimationPrefix = util.Browser.HasSupport.cssTransitions(), // browser-specific prefix for animation directives.
		animateIn, // animation with which to open the dialogue.
		animateOut // animation with which to close the dialogue.

	/**
	 * isValidMDD
	 * @description Check that the Modal Dialogue Definition is valid.
	 * @param MDD (object) - Modal Dialogue Definition.
	 */
	function isValidMDD(MDD) {
		// make sure the MDD is actually an object.
		if ( typeof MDD == 'object' && !( MDD instanceof Array) )
		{
			// check for a title and body.
			if ( ! MDD.title || ! MDD.body ) return false
			
			// check if the MDD is part of a wizard.
			if ( MDD.isWizardDialogue )
			{
				// check for buttons.
				if ( ! MDD.buttons ) return false
				else
				{
					// if there is no previous button, next button or close button then the user cannot escape.
					if ( ! MDD.buttons.next && ! MDD.buttons.prev && ! MDD.buttons.close ) return false
					
				}
			}
			
			if ( MDD.form )
			{
				if ( ! MDD.form.name || ! MDD.form.inputs ) return false
			}
			
			return true
		}
	}

	/**
	 * dialogueFromMDD
	 * @description Creates a fully populated dialogue element from an MDD.
	 * @param MDD (object) - Modal Dialogue Definition.
	 */
	var dialogueFromMDD = function(MDD) {
	
		// alias this.
		var self = this
		this.MDD = MDD
		
		// check that the MDD is valid.
		if ( isValidMDD(MDD) )
		{
			// create the dialogue element.
			var dialogue = this.dialogue = util.createElement({'tag' : 'div', 'id' : MDD.customId || 'ModalDialogue', 'customClass' : 'visible'})
			
			// check if this is an error dialogue
			if ( MDD.errorDialogue == true ) dialogue.addClass('error')
		
			// check for custom alignment specification.
			if ( MDD.alignment && /^(center|right|justify)$/.test(MDD.alignment) ) dialogue.addClass(MDD.alignment)
			
			// create the title.
			var title = util.createElement({'tag' : 'h1', 'inner' : MDD.title, 'appendTo' : dialogue})
			
			// create the body.
			this.createBody(MDD.body)
			
			// create a form in the dialogue if there is one specified.
			if ( MDD.form ) this.createForm(MDD.form)
			
			// create buttons if there are any specified.
			if ( MDD.buttons ) this.createButtons(MDD.buttons, MDD)
			
			// append any custom classes.
			if ( MDD.customClass ) dialogue.addClass(MDD.customClass)
			
			// return the constructed element.
			return dialogue
			
		}
		
		// handle invalid MDD.
		else throw util.error('Invalid Modal Dialogue Definiion.','MDD_ERR')
	
	}
	
	/**
	 * createBody
	 * @description constructs the body for the modal dialogue.
	 * @param body (object) - object to define a form.
	 */
	dialogueFromMDD.prototype.createBody = function( body ) {
	
		var self = this
	
		// if the parameter is not an array then convert it.
		if ( !( body instanceof Array ) ) body = [body]
		
		// iterate the body.
		body.forEach(function(bodyPart) {
		
			// check if the item is an HTMLElement.
			if ( typeof bodyPart == 'object' && bodyPart instanceof Element ) {
			
				// if it is, append the element to the dialogue.
				self.dialogue.appendChild(bodyPart)
			}
				
			// otherwise check if the element is a string.
			else if ( typeof bodyPart == 'string' ) {
			
				// if the text does not have tags then wrap it in a <p>.
				if ( !( /\<.+\>.*\<.+\>/.test(bodyPart) ) ) bodyPart = '<p>' + bodyPart + '</p>'
			
				// if the element is a string then add it directly.
				self.dialogue.innerHTML += bodyPart
			}
		
		})
	
	}

	/**
	 * createForm
	 * @description constructs the form for the modal dialogue.
	 * @param form (object) - definition object for a form.
	 */
	dialogueFromMDD.prototype.createForm = function( form ) {
	
		// construct the form.
		var formElement = util.createElement({
			'tag' : 'form',
			'appendTo' : this.dialogue,
			'setAttributes' : {
				'name' : form.name,
				'method' : 'post'
			}
		})
	
		// array to contain the inputs.
		var inputs = []
	
		// iterate the inputs.
		form.inputs.forEach(function(input, index) {
		
			// check if the input has a title.
			if ( input.title ) var label = util.createElement({'tag' : 'label', 'inner' : input.title})
		
			// check if the input is <select>
			if ( input.type && input.type == 'select' ) {
			
				// create a select input.
				var element = util.createElement({'tag' : 'select', 'setAttributes' : {'name' : input.name}})
				
				// iterate the options.
				input.options.forEach(function(option) {
					
					// create an option element.
					var optionNode = util.createElement({
						'tag' : 'option',
						'inner' : option,
						'appendTo' : element,
						'setAttributes' : {
							'value' : option
						}
					})
					
					if ( input.placeholder && option == input.placeholder ) optionNode.setAttribute('selected', 'selected')
					
				})
				
			}
			
			// button input.
			else if ( input.type && input.type == 'button' && typeof input.callback == 'function' ) {
			
				var element = util.createElement({
					'tag' : 'button',
					'inner' : input.name
				})
			
				util.addListener(element, 'click', input.callback)
			
			}
			
			// if it's not a select element it's an input.
			else {
				
				var element = util.createElement({
					'tag' : 'input',
					'setAttributes' : {
						'name' : input.name || form.name + '-' + index,
						'type' : input.type || 'text'
					}
				})
				
				if ( input.type == 'checkbox' ) element.checked = input.checked || false
				
			}
			
			// check for a placeholder.
			if ( input.placeholder && input.type !== 'select' )
			{
			
				// check for native placeholder support.
				if ( 'placeholder' in element ) {
					element.setAttribute('placeholder', input.placeholder)
				}
				
				// if there is no native support then shim it.
				else {
					require(['UI/Widget/Placeholder/Placeholder'],function(Placeholder) {
					
						new Placeholder(element, input.placeholder)
					
					})
				}
			}
			
			// if the MDD specified an input title..
			if ( label )
			{
				// append the input to the label
				label.appendChild(element)
				
				// and then the label to the form.
				formElement.appendChild(label)
				
			}
			
			// if the MDD specified no title for the input, append the input to the form.
			else formElement.appendChild(element)
		
			inputs.push(element)
		
			// check for a callback function...
			if ( form.callback ) {
			
				// bind the callback to enter.
				util.addListener(element, 'keyup', function(e) {
				
					if ( e.keyCode === 13 ) form.callback.call(ModalDialogue, inputs)
				
				})
			
			}
		
		})
	
		// check for a callback specification.
		if ( typeof form.callback == 'function' ) {
		
			this.MDD.buttons = this.MDD.buttons || {}
		
			this.MDD.buttons[form.buttonName || "Submit"] = function() {
			
				form.callback.call(ModalDialogue, inputs)
			
			}
		
		}
	
		// append the form to the dialogue.
		this.dialogue.appendChild(formElement)
	
	}

	/**
	 * ModalDialogueButton
	 * @description creates a button.
	 * @param name (string) - the text for the button.
	 * @param callback (function) - the function to be executed when the button is clicked.
	 * @param context (object) - the context under which the callback should be executed. (defaults to window.)
	 */
	var ModalDialogueButton = function(name, callback, context) {
	
		var button = util.createElement({'tag' : 'button', 'inner' : name})
		
		util.addListener(button, 'click', (function(callback, context) {
		
			return function(e) {
		
				callback.call(context || ModalDialogue, e)
			
			}
		
		})(callback, context))
	
		return button
	
	}

	/**
	 * createButtons
	 * @description creates button elements for a dialogue.
	 * @param buttons (object) - object to define buttons.
	 */
	dialogueFromMDD.prototype.createButtons = function( buttons, buttonContainer ) {
	
		// create a container for the buttons.
		var buttonContainer = ( ( buttonContainer instanceof Element ) ) ? buttonContainer :  util.createElement({'tag' : 'div', 'customClass' : 'buttons', 'appendTo' : this.dialogue})
	
		// iterate the buttons.
		for ( var i in buttons ) {
		
			// name of the button and the callback that's called when the button is clicked.
			var name, callback
		
			var self = this
		
			// if the value of the object property is a function then set 
			// the callback that function and the name as the property.
			if ( typeof buttons[i] == 'function' ) name = i, callback = buttons[i]
			
			// if the value of the button property is an object then it should
			// have properties for the title and callback.
			else if ( typeof buttons[i] == 'object' ) name = buttons[i].title || buttons[i].name, callback = buttons[i].callback
		
			// if the value of the button property is a boolean then it is
			// indicated that the property should be replaced with a template
			// button definition.
			else if ( typeof buttons[i] == 'boolean' ) {
			
				// override the close button.
				if ( /close/i.test(i) ) {
				
					name = 'Close'
				
					callback = function() {
						
						ModalDialogue.close()
						
					}
				
				}
			
			} 
		
			// determine the context under which the callback is executed. (default to ModalDialogue.)
			var context = ( typeof buttons[i].context == 'object' ) ? buttons[i].context : ModalDialogue
		
			// create the button
			var button = ModalDialogueButton(name, callback, context)
		
			// append it to the container.
			if ( button ) buttonContainer.appendChild(button)
		
		}
	
	}

	/**
	 * ModalDialogue.
	 */
	var ModalDialogue = {}

	/**
	 * createSingle
	 * @description creates a simple dialogue from a Modal Dialogue Definition (MDD).
	 * @param MDD (object) - Modal Dialogue Definition.
	 */
	ModalDialogue.createSingle = function(MDD)
	{
	
		// set the animate in property.
		animateIn = ( MDD.animate && typeof MDD.animate.animateIn !== 'undefined' ) ? MDD.animate.animateIn : null
		
		// set the animate out property.
		animateOut = ( MDD.animate && typeof MDD.animate.animateOut !== 'undefined' ) ? MDD.animate.animateOut : null
	
		var dialogue = new dialogueFromMDD(MDD)
		
		this.open(dialogue)
		
	}

	/**
	 * createWizard
	 * @description Creates a dialogue that allows switching between panes. (Next/Prev)
	 * @param dialogues (array) - An array of MDDs, each MDD is a pane of its own.
	 */
	ModalDialogue.createWizard = function(dialogues, animate)
	{
		// index of the current dialogue.
		var index = 0
		
		// set the animate in property.
		animateIn = ( animate && typeof animate.animateIn !== 'undefined' ) ? animate.animateIn : null
		
		// set the animate out property.
		animateOut = ( animate && typeof animate.animateOut !== 'undefined' ) ? animate.animateOut : null

		// iterate the dialogues.
		dialogues.forEach(function(dialogue, i) {
		
			// check for buttons.
			if ( dialogue.buttons ) {
			
				// iterate the buttons.
				for ( var j in dialogue.buttons ) {
					
					// skip the button if it's not prev or next.
					if ( ! /(prev|next)/i.test(j) || typeof dialogue.buttons[j] !== 'boolean') continue
				
					// override prev or next.
					dialogue.buttons[j] = {
					
						// override name.
						'name' : (j == 'prev') ? 'Previous' : 'Next',
						
						// override callback function.
						'callback' : (function(name) {
							
							return function() {
								
								// remove the current dialogue.
								currentDialogue.removeNode(true)
								
								// increment or decrement the index based on the button that was pressed.
								index = ( name == 'prev' ) ? index - 1 : index + 1
								
								// set the current dialogue to point to the dialogue at the new index.
								currentDialogue = dialogues[index]
								
								// append the new dialogue to the overlay.
								overlay.appendChild(currentDialogue)
								
							}
							
						})(j)
					}
					
				}
			
			}
		
			// turn the MDD into an actual element structure.
			dialogues[i] = new dialogueFromMDD(dialogue)
		
		})
		
		this.open(dialogues[0])
	}

	/**
	 * createMultiView
	 * @description Creates a dialogue with a sidebar and views.
	 * @param MVD (object) - Defines the dialogue. (See documentation.)
	 */
	ModalDialogue.createMultiView = function(MVD)
	{
		// return false if the MVD is invalid.
		if ( typeof MVD !== 'object' ) return false
	
		// set the animate in property.
		animateIn = ( MVD.animate && typeof MVD.animate.animateIn !== 'undefined' ) ? MVD.animate.animateIn : null
		
		// set the animate out property.
		animateOut = ( MVD.animate && typeof MVD.animate.animateOut !== 'undefined' ) ? MVD.animate.animateOut : null
	
		/**
		 * NavigationItem
		 * @description creates a navigation item.
		 * @param name (string) - the name of the view.
		 * @param index (int) - the index of the view.
		 * @param callback (function) - the function called when the navigation item is clicked.
		 * @param context (object) - the context under which the callback is called.
		 */
		var NavigationItem = function(name, index, callback, context) {
		
			var item = util.createElement({
				'tag' : 'li',
				'inner' : name,
				'setAttributes' : {
					'data-viewIndex' : index
				}
			})
		
			util.addListener(item, 'click', (function() {
			
				return function() {
				
					callback.call(callback || window, index)
				
				}
			
			})())
		
			if ( index === 0 ) item.addClass('active')
		
			return item
		
		}
	
		/**
		 * switchView
		 * @description switches between views.
		 * @param i (int) - the index of the view to switch to.
		 */
		var switchView = function(i) {
		
			// remove the previous navigation item from the active list.
			navItems[index].removeClass('active')
		
			// set the index to the index of the new view.
			index = i
		
			// make the new navigation item active.
			navItems[index].addClass('active')
		
			// remove the current view.
			currentView.removeNode(true)
		
			// set the current view to the new index.
			currentView = views[i]
			
			// add the new current view.
			viewContainer.appendChild(currentView)
		
		}
	
		var dialogue, // root node.
			navigation,  // enables navigation between views.
			navItems = [], // array of navigation items.
			navigationList, // ordered list of navigation items.
			viewContainer, // contains the current view.
			currentView, // the current view element.
			title, // title for the dialogue. (inside of the navigation)
			buttonContainer, // container for buttons.
			views = [], // list of views.
			index = 0, // index of the current view.
			self = this

		dialogue = util.createElement({'tag' : 'div', 'id' : 'ModalDialogue', 'customClass' : 'sidebar'})

		navigation = util.createElement({'tag' : 'div', 'customClass' : 'navigation', 'appendTo' : dialogue})
		
		viewContainer = util.createElement({'tag' : 'div', 'customClass' : 'views', 'appendTo' : dialogue})
		
		if ( typeof MVD.title == 'string' ) title = util.createElement({'tag' : 'h1', 'inner' : MVD.title, 'appendTo' : navigation})

		navigationList = util.createElement({'tag' : 'ol', 'appendTo' : navigation})

		// set buttons.
		if ( typeof MVD.buttons == 'object') {
		
			// create a button container element.
			buttonContainer = util.createElement({'tag' : 'div', 'customClass' : 'buttons', 'appendTo' : viewContainer})
		
			// hijack the createButtons method used in creating a dialogue.
			dialogueFromMDD.prototype.createButtons(MVD.buttons, buttonContainer)
		
		}

		// set views.
		if ( MVD.views instanceof Array ) {
		
			MVD.views.forEach(function(MDD, i) {
			
				// check the MDD is valid
				if ( isValidMDD(MDD) ) {
				
					// remove and button specifications. (buttons should be specified in the MVD.)
					MDD.buttons && delete MDD.buttons
				
					// delete form callback.
					MDD.form && MDD.form.callback && delete MDD.form.callback
				
					// set the Id of the view.
					MDD.customId = 'ModalView' + (i + 1)
				
					// add the view class.
					MDD.customClass = 'view'
				
					// construct the dialogue.
					views.push(new dialogueFromMDD(MDD))
				
					var navItem = NavigationItem(MDD.navTitle || MDD.title, i, switchView, ModalDialogue)
				
					navItems.push(navItem)
				
					navigationList.appendChild(navItem)
				
				}
			
				else throw util.error('Invalid MDD - ' + i)
			
			})
		
		}
		
		else throw util.error('The MutiView Definition does not have any views.')

		// set the current view.
		currentView = views[0]

		// add the current view.
		viewContainer.appendChild(currentView)

		// open the view.
		this.open(dialogue, MVD.animate && MVD.animate.animateIn)

		return dialogue

	}
	
	/**
	 * close
	 * @description removes the currently visible modal dialogue.
	 */
	ModalDialogue.close = function(){
	
		if ( AnimationPrefix && animateOut ) {
		
			new Animator(overlay, 'fadeOut', 0.5)
			
			new Animator(currentDialogue, animateOut, 0.5, function() {
				
				currentDialogue.removeNode(true)
				
				overlay.removeClass('visible')
				
			})
		}
		
		else {
		
			currentDialogue.removeNode(true)
			
			overlay.removeClass('visible')
		
		}
	
	}

	/**
	 * open
	 * @description Adds the dialogue to the overlay.
	 * @param dialogue (HTMLElement) - dialogue to add.
	 */
	ModalDialogue.open = function(dialogue)
	{
	
		// remove any dialogues that may already exist.
		overlay.removeChildren()
		
		// set the new currentDialogue.
		currentDialogue = dialogue
		
		// if there's a prefix then get the animation module.
		if ( AnimationPrefix && animateIn ) {
		
			var open = function(UIAnimator) {
			
				if ( UIAnimator ) Animator = UIAnimator
			
				// add the dialogue to the overlay.
				overlay.appendChild(dialogue)
				
				// make the overlay visible.
				overlay.addClass('visible')
				
				// animate the overlay in.
				new Animator(overlay, 'fadeIn', 0.5)
				
				// animate the dialogue in.
				new Animator(dialogue, animateIn, 0.5)
				
			}
		
			if ( ! Animator ) require(['UI/Animator/Animator'], open)
			
			else open()
						
		}
		else {
		
			overlay.appendChild(dialogue)
		
			overlay.addClass('visible')
		
		}
		
	}

	return ModalDialogue

})