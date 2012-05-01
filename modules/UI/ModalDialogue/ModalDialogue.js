/**
 * ModalDialogue
 * @description Provides functionality for dynamically constructing modal dialogues.
 * @method createSingle - Method for creating a simple dialogue.
 * @method createWizard - Method for creating a dialogue with multiple panes.
 * @method createMultiView - Method for creating a view-based dialogue with sidebar navigation.
 * @dependencies - modules/util, modal.css, modal.mobile.css (For mobile.)
 */
define(['require','util'],function(require,util){

	/**
	 * Stylesheet injection.
	 */
	util.registerStylesheet(require.toUrl('./ModalDialogue.css'));
	
	// mobile stylesheet.
	if ( util.Browser.isMobile() )
	{
		util.registerStylesheet(require.toUrl('./ModalDialogue.mobile.css'));
	}

	/**
	 * overlay
	 */
	var overlay;
	
	if ( document.getElementById('ModalDialogueOverlay') )
	{
		overlay = document.getElementById('ModalDialogueOverlay');
	}
	else
	{
		overlay = util.createElement({'tag' : 'div', 'id' : 'ModalDialogueOverlay', appendTo : document.body});
	}
	
	/**
	 * currentDialogue
	 * @description The current visible dialogue.
	 */
	var currentDialogue = null;

	/**
	 * isValidMDD
	 * @description Check that the Modal Dialogue Definition is valid.
	 */
	function isValidMDD(MDD) {
		// make sure the MDD is actually an object.
		if ( typeof MDD == 'object' && !( MDD instanceof Array) )
		{
			// check for a title and body.
			if ( ! MDD.title || ! MDD.body ) return false;
			
			// check if the MDD is part of a wizard.
			if ( MDD.isWizardDialogue )
			{
				// check for buttons.
				if ( ! MDD.buttons ) return false;
				else
				{
					// if there is no previous button, next button or close button then the user cannot escape.
					if ( ! MDD.buttons.next && ! MDD.buttons.prev && ! MDD.buttons.close ) return false;
					
				}
			}
			
			if ( MDD.form )
			{
				if ( ! MDD.form.name || ! MDD.form.inputs ) return false;
			}
			
			return true;
		}
	}

	/**
	 * dialogueFromMDD
	 * @description Creates a fully populated dialogue element from an MDD.
	 * @param MDD - Modal Dialogue definition object.
	 */
	function dialogueFromMDD( MDD ) {
	
		// alias this.
		var self = this;
		
		// check that the MDD is valid.
		if ( isValidMDD(MDD) )
		{
			// create the dialogue element.
			var dialogue = this.dialogue = util.createElement({'tag' : 'div', 'id' : MDD.customId || 'ModalDialogue', 'customClass' : 'visible'});
			
			// check if this is an error dialogue
			if ( MDD.errorDialogue == true ) dialogue.addClass('error');
		
			// check for custom alignment specification.
			if ( MDD.alignment && /^(center|right|justify)$/.test(MDD.alignment) ) dialogue.addClass(MDD.alignment);
			
			// create the title.
			var title = util.createElement({'tag' : 'h1', 'inner' : MDD.title, 'appendTo' : dialogue});
			
			// create the body.
			this.createBody(MDD.body);
			
			// create a form in the dialogue if there is one specified.
			if ( MDD.form ) this.createForm(MDD.form);
			
			// create buttons if there are any specified.
			if ( MDD.buttons ) this.createButtons(MDD.buttons, MDD);
			
			// append any custom classes.
			if ( MDD.customClass ) dialogue.addClass(MDD.customClass);
			
			// return the constructed element.
			return dialogue;
			
		}
		
		// handle invalid MDD.
		else throw util.error('Invalid Modal Dialogue Definiion.','MDD_ERR');
	
	}
	
	/**
	 * createBody
	 * @description constructs the body for the modal dialogue.
	 * @param body - definition object for the body.
	 */
	dialogueFromMDD.prototype.createBody = function( body ) {
	
		var self = this;
	
		// if the parameter is not an array then convert it.
		if ( !( body instanceof Array ) ) body = [body];
		
		// iterate the body.
		body.forEach(function(bodyPart){
		
			// check if the item is an HTMLElement.
			if ( typeof bodyPart == 'object' && bodyPart instanceof Element )
			{
				// if it is, append the element to the dialogue.
				self.dialogue.appendChild(item);
			}
				
			// otherwise check if the element is a string.
			else if ( typeof bodyPart == 'string' )
			{
				// if the text does not have tags then wrap it in a <p>.
				if ( !( /\<.+\>.*\<.+\>/.test(bodyPart) ) ) bodyPart = '<p>' + bodyPart + '</p>';
			
				// if the element is a string then add it directly.
				self.dialogue.innerHTML += bodyPart;
			}
		
		});
	
	}

	/**
	 * createForm
	 * @description constructs the form for the modal dialogue.
	 * @param form - definition object for a form.
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
		});
	
		// iterate the inputs.
		form.inputs.forEach(function(input, index) {
		
			// check if the input has a title.
			if ( input.title ) var label = util.createElement({'tag' : 'label', 'inner' : input.title});
		
			// check if the input is <select>
			if ( input.type && input.type == 'select' ) {
			
				// create a select input.
				var element = document.createElement('select');
				
				// iterate the options.
				input.options.forEach(function(option) {
					
					// create an option element.
					util.createElement({
						'tag' : 'option',
						'inner' : option,
						'appendTo' : element,
						'setAttributes' : {
							'value' : option
						}
					});
					
				});
				
			}
			
			// if it's not a select element it's an input.
			else {
				
				var element = util.createElement({
					'tag' : 'input',
					'setAttributes' : {
						'name' : input.name || form.name + '-' + index,
						'type' : input.type || 'text'
					}
				});
				
			}
			
			// check for a placeholder.
			if ( input.placeholder )
			{
			
				// check for native placeholder support.
				if ( 'placeholder' in element ) {
					element.setAttribute('placeholder', input.placeholder);
				}
				
				// if there is no native support then shim it.
				else {
					require(['UI/Widget/Placeholder/Placeholder'],function(Placeholder) {
					
						new Placeholder(element, input.placeholder);
					
					});
				}
			}
			
			// if the MDD specified an input title..
			if ( label )
			{
				// append the input to the label
				label.appendChild(element);
				
				// and then the label to the form.
				formElement.appendChild(label);
				
			}
			
			// if the MDD specified no title for the input, append the input to the form.
			else formElement.appendChild(element);
		
		});
	
		// append the form to the dialogue.
		this.dialogue.appendChild(formElement);
	
	}

	/**
	 * createButtons
	 * @description creates button elements for a dialogue.
	 * @param buttons - object literal definition of the buttons.
	 */
	dialogueFromMDD.prototype.createButtons = function( buttons, MDD ) {
	
		// create a container for the buttons.
		var buttonContainer = util.createElement({'tag' : 'div', 'customClass' : 'buttons', 'appendTo' : this.dialogue});
	
		// iterate the buttons object.
		for ( var i in buttons )
		{
			// create te button.
			var button = util.createElement({'tag' : 'button', 'appendTo' : buttonContainer });
			
			// check if the button is close and doesn't have a function associated.
			if ( /close/i.test(i) && ! ( typeof buttons[i] == 'function') )
			{
				// set the text.
				button.innerHTML = "Close";
				
				// add a listener for the click event.
				util.addListener(button, 'click', function(){
				
					// close the dialogue on click.
					ModalDialogue.close();
				
				});
			}
			
			// if the button has a callback specified then use it.
			else if ( typeof buttons[i] == 'function' )
			{
				// set the button text.
				button.innerHTML = i;
				
				// if it does then listen for a click.
				util.addListener(button,'click',function(){
				
					// callback in the context of the dialogue.
					MDD.buttons[i].call(ModalDialogue);
				
				});
			}
			
		}
	
	}

	/**
	 * ModalDialogue.
	 */
	var ModalDialogue = {}

	/**
	 * createSingle
	 * @description creates a simple dialogue from a Modal Dialogue Definition (MDD).
	 */
	ModalDialogue.createSingle = function(MDD)
	{
	
		var dialogue = new dialogueFromMDD(MDD);
			
		this.open( dialogue,MDD.animateIn || null );
		
	}

	/**
	 * createWizard
	 * @description Creates a dialogue that allows switching between panes. (Next/Prev)
	 * @param MDDArray (Array) - An array of MDDs, each MDD is a pane of its own.
	 */
	ModalDialogue.createWizard = function(dialogues, animateIn)
	{
		
		// usual lark.
		var self = this;
		
		// array to store the dialogue panes in.
		var panes = [];
			
		// the parent dialogue element.
		var wizard = util.createElement({'tag' : 'div', 'id' : 'ModalDialogue'});
		
		dialogues.forEach(function(dialogue,index){
		
			if ( isValidMDD(dialogue) )
			{
				// inject a custom id for the MDD.
				dialogue.customId = "WizardDialogue" + (index + 1);
						
				// specify that the MDD is a wizard dialogue view.
				dialogue.isWizardDialogue = true;
				
				// check for a next button.
				if ( typeof dialogue.buttons.next == "boolean" )
				{
					// add template specification.
					dialogue.buttons.next = {
						"title" : "Next",
						"callback" : function(e, index){
							
							// remove the current pane.
							currentDialogue.removeChildren();
							
							// add the next pane.
							currentDialogue.appendChild(panes[index + 1]);
								
						},
						"callbackContext" : this
					}
				}
				
				// check for a previous button.
				if ( typeof dialogue.buttons.prev == "boolean" )
				{
					// add template specification.
					dialogue.buttons.prev = {
						"title" : "Previous",
						"callback" : function(e, index){
						
							// remove the current pane.
							currentDialogue.removeChildren();
							
							// add the next pane.
							currentDialogue.appendChild(panes[index - 1]);
						
						},
						"callbackContext" : this // cannot be used externally.
					}
				
				}
				
				// create the dialogue.
				panes.push(new dialogueFromMDD(dialogue));
				
			}
			else
			{
				// log any error.
				console.error("MDD " + (i + 1) + " is invalid.");
			}
		});
		
		// put the first dialogue in the wizard.
		wizard.appendChild(panes[0]);
		
		self.open(wizard,animateIn || null);
		
	}

	/**
	 * createMultiView
	 * @description Creates a dialogue with a sidebar and views.
	 * @param dialogueDefinition (object) - Defines the dialogue. (See documentation.)
	 */
	ModalDialogue.createMultiView = function(dialogueDefinition)
	{
		var self = this;
	
		// check for the dialogue definition.
		if ( dialogueDefinition )
		{
			// create the dialogue.
			var dialogue = document.createElement('div');
			dialogue.setAttribute('id','ModalDialogue');
			dialogue.setAttribute('class','sidebar');
			
			// create the navigation sidebar.
			var nav = document.createElement('div');
			nav.setAttribute('class','navigation');
			
			// create the navigation items container.
			var navItems = document.createElement('ol');
			
			// create the view container.
			var viewContainer = document.createElement('div');
			viewContainer.setAttribute('class','views');
			
			// create an array to contain view elements.
			var views = [];
			
			// set the current view index.
			var currentViewIndex = this.currentViewIndex = 0;
			
			// append the nav and view container to the dialogue.
			dialogue.appendChild(nav);
			dialogue.appendChild(viewContainer);
			
			// check for a title.
			if ( dialogueDefinition.title )
			{
				// create the title and append it to nav..
				var title = document.createElement('h1');
				title.innerHTML = dialogueDefinition.title;
				nav.appendChild(title);
			}
			
			// check for buttons.
			if ( dialogueDefinition.buttons )
			{

				var buttonContainer = document.createElement('div');
			
				buttonContainer.setAttribute('class','buttons');
			
				for ( var i in dialogueDefinition.buttons )
				{
					
					var button = document.createElement('button');
				
					if ( /close/i.test(i) && typeof dialogueDefinition.buttons[i] !== "function"  )
					{
						button.innerHTML = "Close";
						
						util.addListener(button,'click',function(){
						
							self.close();
						
						});
						
					}
					else
					{
						button.innerHTML = i;
						
						if ( typeof dialogueDefinition.buttons[i] == "function" )
						{
							util.addListener(button,'click',function(e){
								
								dialogueDefinition.buttons[i].call(self,e);
							
							});
						}
					}
					
					buttonContainer.appendChild(button);
					
				}
				
				viewContainer.appendChild(buttonContainer);
			}
			
			// check for views.
			if ( dialogueDefinition.views )
			{
			
				// implement view switcher.
				function switchView(e){
				
					var target = e.target || e.srcElement;
				
					// make sure we're not already on this view.
					if ( ! ( currentViewIndex == target.getAttribute('data-viewIndex') ) )
					{
						// close the current view.
						views[currentViewIndex].removeNode(true);
						
						//views[currentViewIndex].parentNode.removeChild(views[currentViewIndex]);
						
						// append the specified view.
						viewContainer.appendChild(views[parseInt(target.getAttribute('data-viewIndex'))]);
						
						navItems.children[currentViewIndex].removeAttribute('class');
						
						// set currentView.
						currentViewIndex = parseInt(target.getAttribute('data-viewIndex'));
						
						navItems.children[currentViewIndex].setAttribute('class','active');
						
					}
				
				}
			
				// check that there are views.
				if ( dialogueDefinition.views.length == 0 ) 
				{
					// if there are not then log an error.
					console.error("dialogueDefinition has no views. Cannot continue.");
					
					// break out.
					return false;
				}
				
				dialogueDefinition.views.forEach(function(view,index){
				
					// check the view is valid.
					if ( isValidMDD(view) )
					{
						// add the ModalView id.
						view.customId = "ModalView" + (index + 1);
						
						// add the view class.
						view.customClass = "view";
						
						// check for button definitions.
						if ( view.buttons )
						{
							// remove buttons from the MDD. (createSingleWithSidebar does not allow per-view buttons.)
							delete view.buttons;
						}
						
						// create the view.
						var dialogue = new dialogueFromMDD(view);
						
						// set view index.
						dialogue.setAttribute('data-viewIndex', index);
						
						// push the view to the views array.
						views.push(dialogue);
						
						// check for a navigation title.
						var navItem = document.createElement('li');
						
						navItem.innerHTML = view.navTitle || view.title;
							
						navItem.setAttribute('data-viewIndex',index);
							
						util.addListener(navItem,'click',function(e){
						
							switchView.call(self, e);
						
						});
							
						if ( index == 0 ) navItem.setAttribute('class','active');
							
						navItems.appendChild(navItem);
					}
					else
					{
						console.error("Invalid view. Choked on MDD " + (index + 1));
						
						return false;
						
					}
				
				});
				
				viewContainer.appendChild(views[0]);
			}
			
			// append the dialogue to the overlay.
			overlay.appendChild(dialogue);
			overlay.setAttribute('class','visible');
			
			// append the navItems.
			nav.appendChild(navItems);
			
			self.open(dialogue,dialogueDefinition.animateIn || null);
			
			// return the dialogue.
			return dialogue;
		}
		
		// if there is no definition, return false.
		else return false;
	}

	/**
	 * close
	 * @description removes the currently visible modal dialogue.
	 */
	ModalDialogue.close = function(animation){
	
		if ( animation ) {
			
			// handle animation.
			
		}
	
		else {
			
			overlay.removeAttribute('class');
			overlay.removeAttribute('style');
		
			if ( currentDialogue )
			{
				currentDialogue.removeNode(true);
			}
			
		}
	
	}

	/**
	 * open
	 * @description Adds the dialogue to the overlay.
	 * @param dialogue (HTMLElement) - dialogue to add.
	 * @param animation (string) - name of the animation. (slideTop, slideBottom, fade.)
	 */
	ModalDialogue.open = function(dialogue, animation)
	{
	
		// remove any dialogues that may already exist.
		overlay.removeChildren();
		
		// set the new currentDialogue.
		currentDialogue = dialogue;
		
		// check for an animation setting.
		if ( typeof animation == 'string' && 
			/(slideTop|slideBottom|fade)/.test(animation) &&
			util.Browser.HasSupport.cssTransitions() &&
			! util.Browser.isMobile() )
		{
		
			var transition = util.Browser.HasSupport.cssTransitions();
		
			// fade overlay in.
			overlay.style.opacity = 0;
		
			overlay.style[transition] = 'opacity 0.2s linear';
		
			// slideTop/Bottom.
			if ( /slide/.test(animation) )
			{
				dialogue.style.marginTop = ( animation == 'slideTop' ) ? '-100%' : '100%';
				
				dialogue.style[transition] = 'margin-top 0.3s linear';
				
				overlay.setAttribute('class','visible');
				
				overlay.appendChild(dialogue);
				
				setTimeout(function(){
				
					overlay.style.opacity = 1;
				
					dialogue.style.marginTop = '10%';
				
				}, 50);
				
			}
			
			// fade.
			if ( animation == 'fade' )
			{
				
				dialogue.style.opacity = 0;
				
				dialogue.style[transition] = 'opacity 0.2s linear';
				
				overlay.setAttribute('class','visible');
				
				overlay.appendChild(dialogue);
				
				setTimeout(function(){
				
					overlay.style.opacity = 1;
				
					dialogue.style.opacity = 1;
				
				},1);
				
			}
			
		}
		else
		{
			
			// append the new dialogue.
			overlay.appendChild(dialogue);
			
			// show the dialogue.
			overlay.setAttribute('class','visible');
			
		}
		
	}

	return ModalDialogue;

});