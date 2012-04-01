/**
 * ModalDialogue
 * @description Provides functionality for dynamically constructing modal dialogues.
 * @method createDialogue - Method for creating a simple dialogue.
 * @method createWizard - Method for creating a dialogue with multiple panes.
 * @method createViewBasedDialogue - Method for creating a view-based dialogue with sidebar navigation.
 * @dependencies - modules/util, modal.css, modal.mobile.css (For mobile.)
 */
define(['require','util'],function(require,util){

	/**
	 * Stylesheet injection.
	 */
	util.addStylesheet(require.toUrl('./modal.css'));
	
	// mobile stylesheet.
	if ( util.Browser.isMobile() )
	{
		util.addStylesheet(require.toUrl('./modal.mobile.css'));
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
		overlay = document.createElement('div');
		
		overlay.setAttribute('id','ModalDialogueOverlay');
		
		document.body.appendChild(overlay);
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
	function isValidMDD(MDD)
	{
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
	 * constructDialogueFromMDD
	 * @description Creates a fully populated dialogue element from an MDD.
	 */
	function constructDialogueFromMDD(MDD)
	{
		// usual lark.
		var self = this;
	
		// check for a dialogue specification.
		if ( isValidMDD(MDD) )
		{
		
			// check for an overlay element.
			if ( overlay ) overlay = overlay;
		
			// create the dialogue element.
			var dialogue = document.createElement('div');
			
			// set the id.
			dialogue.setAttribute('id', MDD.customId || 'ModalDialogue');
		
			// keep dialogue classes here.
			var classes = ['visible'];
		
			// check if this is an error dialogue
			if ( MDD.errorDialogue ) classes.push('error');
		
			// check for custom alignment specification.
			if ( MDD.alignment && /^(center|right|justify)$/.test(MDD.alignment) )
			{
				// set centre or right alignment.
				classes.push(MDD.alignment);
			}
		
			/* DIALOGUE HEADER */
			var title = document.createElement('h1');
				
			// put the MDD title into the header.
			title.innerHTML = MDD.title;
				
			// append the header to the dialogue.
			dialogue.appendChild(title);
		
			/* DIALOGUE BODY */
			if ( !( MDD.body instanceof Array ) )
			{
				// if not, just put the element into an array to keep compatibility.
				MDD.body = [MDD.body];
			}
			
			MDD.body.forEach(function(item){
				
				// check if the item is an HTMLElement.
				if ( item instanceof HTMLElement )
				{
					// if it is, append the element to the dialogue.
					dialogue.appendChild(item);
				}
					
				// otherwise check if the element is a string.
				else if ( typeof item == 'string' )
				{
					// if the text does not have tags then wrap it in a <p>.
					if ( !( /\<.+\>.*\<.+\>/.test(item) ) ) item = '<p>' + item + '</p>';
				
					// if the element is a string then add it directly.
					dialogue.innerHTML += item;
				}
				
			});
			
			/* DIALOGUE FORM */
			if ( MDD.form )
			{
				// add form to the classes.
				classes.push('form');
				
				// make a new form.
				var form = document.createElement('form');
				
				// set the form name.
				form.setAttribute('name', MDD.form.name);
				
				// set a default method. (For semantics.)
				form.setAttribute('method','post');
				
				// for each input.
				MDD.form.inputs.forEach(function(input,index){
				
					// check if the input has a title.
					if ( input.title )
					{
						// make a new label.
						var label = document.createElement('label');
						
						// give the label some text.
						label.innerHTML = input.title;
					}
				
					// check if the input is <select>
					if ( input.type && input.type == 'select' )
					{
						var element = document.createElement('select');
						
						input.options.forEach(function(option){
							
							var option = document.createElement('option');
							
							option.setAttribute('value', option);
							
							option.innerHTML = option;
							
							element.appendChild(option);
							
						});
						
						if ( input.placeholder )
						{
							element.value = input.placeholder;
						}
					}
				
					// otherwise it's just a regular <input/>
					else
					{
						var element = document.createElement('input');
						
						element.setAttribute('name', input.name || MDD.form.name + '-' + index);
						
						element.setAttribute('type', input.type || 'text')
						
						if ( input.placeholder )
						{
							if ( ! ( 'placeholder' in element ) )
							{
								element.value = input.placeholder;
								
								util.addListener(element,'focus',function(e){
									
									var element = (e.target || e.srcElement);
									
									if ( element.getAttribute('value') == element.getAttribute('placeholder') )
									{
										element.setAttribute('value','');
									}
									
								});
								
								util.addListener(element,'blur',function(e){
								
									var element = (e.target || e.srcElement);
								
									if ( element.getAttribute('value') == '' )
									{
										element.setAttribute('value',element.getAttribute('placeholder'));
									}
								
								});
							}
							
							element.setAttribute('placeholder', input.placeholder);
						}
						
					}
				
					// if the MDD specified an input title..
					if ( label )
					{
						// append the input to the label
						label.appendChild(element);
						
						// and then the label to the form.
						form.appendChild(label);
						
					}
					
					// if the MDD specified no title for the input, append the input to the form.
					else form.appendChild(element);
				
				});
				
				// append the form.
				dialogue.appendChild(form);
				
			}
		
			/* DIALOGUE BUTTONS */
			if ( MDD.buttons )
			{
				// create the button container.
				var buttonContainer = document.createElement('div');
			
				// set the class.
				buttonContainer.setAttribute('class','buttons');
			
				// loop through the buttons.
				for ( var i in MDD.buttons )
				{
					// make a button.
					var button = document.createElement('button');
					
					// if a close button is specified, create a close button.
					if ( /close/i.test(i) && ! ( typeof MDD.buttons[i] == 'function') )
					{
						// give it a title.
						button.innerHTML = 'Close';
						
						if ( typeof MDD.buttons[i] == 'function' )
						{
							
							util.addListener(button,'click',function(){
							
								// yes, that means what it says.
								MDD.buttons[i].call(ModalDialogue);
							
							});
							
						}
						else
						{
							// close the dialogue when it's pressed.
							util.addListener(button,'click',function(){
							
								// yes, that means what it says.
								ModalDialogue.close();
							
							});
						}
					}
					else if ( typeof MDD.buttons[i] == 'object' )
					{
					
						button.innerHTML = MDD.buttons[i].title || i;
					
						if ( typeof MDD.buttons[i].callback == 'function' )
						{
						
							if ( MDD.isWizardDialogue )
							{
								var index = parseInt(MDD.customId.match(/\d/)[0]);
								
								if ( i == 'next' )
								{
									util.addListener(button,'click',function(e){
									
										MDD.buttons.next.callback.call(MDD.buttons.next.callbackContext,e,index);
									
									});
								}
								if ( i == 'prev' ) {
								
								util.addListener(button,'click',function(e){
								
									MDD.buttons.prev.callback.call(MDD.buttons.prev.callbackContext,e,index);
								
								});
								
								}
								
							}
							else
							{
								util.addListener(button,'click',MDD.buttons[i].callback);
							}
						}
					
					}
					// check if it has a callback.
					else if ( typeof MDD.buttons[i] == 'function' )
					{
					
						// if there's a generic button, let it title itself.
						button.innerHTML = i;
					
						// if it does then listen for a click.
						util.addListener(button,'click',function(){
						
							MDD.buttons[i].call(self);
						
						});
						
					}
					
					// if it doesn't.. screw it.
					else continue;
					
					// add the button to the dialogue.
					buttonContainer.appendChild(button);
				}
				
				// if there are actually buttons...
				if ( buttonContainer.children.length != 0 )
				{
					// append the container.
					dialogue.appendChild(buttonContainer);
				}
				
				// if there are no buttons, close the container.
				else buttonContainer = null;
			}
		
			/* DIALOGUE CLASSES */
			if ( MDD.class )
			{
				// check for an array of classes.
				if ( MDD.class instanceof Array )
				{
					classes = MDD.class.concat(classes);
				}
				
				else if ( typeof MDD.class == 'string' )
				{
					classes.push(MDD.class);
				}
				
			}
			
			// set the dialogue classes.
			dialogue.setAttribute('class', classes.join(' '));
		
			// return the constructed dialogue.
			return dialogue;
		}
		else
		{
			throw {
				'message' : 'The specified MDD is invalid.',
				'name' : 'MDD_FAULT'
			};
		}
		
		// if there is no dialogue specification return nothing.
		return null;
	}
	
	/**
	 * ModalDialogue.
	 */
	var ModalDialogue = {}

	/**
	 * createDialogue
	 * @description creates a simple dialogue from a Modal Dialogue Definition (MDD).
	 */
	ModalDialogue.createDialogue = function(MDD)
	{
	
		// check that there is actually an MDD.
		if ( isValidMDD(MDD) )
		{
		
			var dialogue = constructDialogueFromMDD(MDD);
			
			self.open(dialogue,MDD.animateIn || null);
			
		}
		
		// if there's no MDD, log an error.
		else console.error('ModalDialogue::createDialogue - No MDD!');
	
	}

	/**
	 * createWizard
	 * @description Creates a dialogue that allows switching between panes. (Next/Prev)
	 * @param MDDArray (Array) - An array of MDDs, each MDD is a pane of its own.
	 */
	ModalDialogue.createWizard = function(dialogues,animateIn)
	{
		
		// usual lark.
		var self = this;
		
		// check for existing dialogues.
		if ( overlay.children.length >= 1 )
		{
			// remove them.
			util.removeNode(overlay.children[0]);
		}
		
		// array to store the dialogue panes in.
		var panes = [];
			
		// the parent dialogue element.
		var wizard = document.createElement('div');
			
		// make the wizard the ModalDialogue.
		wizard.setAttribute('id','ModalDialogue');
		
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
						"callback" : function(e,i){
							
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
						"callback" : function(e,i){
						
							// remove the current pane.
							wizard.children[0].removeNode();
							
							// add the previous pane.
							wizard.appendChild(panes[i - 2]);
						
						},
						"callbackContext" : this // cannot be used externally.
					}
				
				}
				
				// create the dialogue.
				panes.push(constructDialogueFromMDD(dialogue));
				
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
	 * createViewBasedDialogue
	 * @description Creates a dialogue with a sidebar and views.
	 * @param dialogueDefinition (object) - Defines the dialogue. (See documentation.)
	 */
	ModalDialogue.createViewBasedDialogue = function(dialogueDefinition)
	{
		var self = this;
	
		// remove any dialogues that are already present.
		if ( currentDialogue ) currentDialogue.removeNode();
	
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
			
			// check for views.
			if ( dialogueDefinition.views )
			{
			
				// implement view switcher.
				function switchView(e){
				
					var t = e.target || e.srcElement;
				
					// make sure we're not already on this view.
					if ( ! ( currentViewIndex == t.getAttribute('data-viewIndex') ) )
					{
						// close the current view.
						views[currentViewIndex].removeNode();
						
						// append the specified view.
						viewContainer.appendChild(views[parseInt(t.getAttribute('data-viewIndex'))]);
						
						navItems.children[currentViewIndex].removeAttribute('class');
						
						// set currentView.
						currentViewIndex = parseInt(t.getAttribute('data-viewIndex'));
						
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
						view.class = "view";
						
						// check for button definitions.
						if ( view.buttons )
						{
							// remove buttons from the MDD. (createDialogueWithSidebar does not allow per-view buttons.)
							delete view.buttons;
						}
						
						// create the view.
						var dialogue = constructDialogueFromMDD(view);
						
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
						console.error("Invalid view. Choked on DMO " + (index + 1));
						
						return false;
						
					}
				
				});
				
				viewContainer.appendChild(views[0]);
			}
			
			// check for buttons.
			if ( dialogueDefinition.buttons )
			{

				var buttonContainer = document.createElement('div');
			
				buttonContainer.setAttribute('class','buttons');
			
				for ( var i in dialogueDefinition.buttons )
				{
					
					var button = document.createElement('button');
				
					if ( i == "close" && typeof dialogueDefinition.buttons[i] !== "function"  )
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
	ModalDialogue.close = function(){
	
		overlay.removeAttribute('class');
	
		overlay.removeAttribute('style');
	
		if ( currentDialogue ) currentDialogue.removeNode();
	
	}

	/**
	 * open
	 * @description Adds the dialogue to the overlay.
	 * @param dialogue (HTMLElement) - dialogue to add.
	 * @param animation (string) - name of the animation. (slideTop, slideBottom, fade.)
	 */
	ModalDialogue.open = function(dialogue,animation)
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
		
			// animate overlay appearance.
			overlay.style.opacity = 0;
		
			overlay.style[transition] = 'opacity 0.5s linear';
		
			// slideTop/Bottom.
			if ( /slide/.test(animation) )
			{
				dialogue.style.marginTop = ( animation == 'slideTop' ) ? '-100%' : '100%';
				
				dialogue.style[transition] = 'margin-top 0.5s linear';
				
				overlay.setAttribute('class','visible');
				
				overlay.appendChild(dialogue);
				
				setTimeout(function(){
				
					overlay.style.opacity = 1;
				
					dialogue.style.marginTop = '10%';
				
				}, 1);
				
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