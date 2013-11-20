/* CAT - Calendar Administration Tool
** Core methods, login handling
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/


/**
 * @namespace Core
 * @name System Core
 * @desc Contains all methos of the page system and everything needed to handle login actions
 */
var system = {
	'data': "",
	
	
	/**
	 * @name handleError
	 * @desc Handly any error that may occur
	 * @param {string} message - The error mesage the system will output
	 */
	handleError: function(message){
		$('#errormsg').text(message);
		$('#errors').fadeIn();
	},
	
	
	page: {
		current: "",
		locked:  false,
	
		/**
		 * @name loadPage
		 * @desc Load the selected page from its HTML file via AJAX request
		 * @param {string} target - Name of the page and its HTML file to load
		 */
		load: function(target){
		
			system.page.current = target;

			system.loader('show');
			system.popup('close');
			
			$.get('./src/page/'+target+'.html', function(data){
			
				$('#contentInner').hide();
				$('#contentInner').html("");
				$('#contentInner').html(data);
				
				func = window["pageinit_"+target];
				func();
		
				system.addListener.ajaxLink();
				
			});
		},
		
		/**
		 * @name appedPage
		 * @desc Append a loaded page to the DOM (#content)
		 */
		append: function(){
		
			system.loader('hide');
			$('#contentInner').fadeIn('fast');
			
		},
		
		
		/**
		 * @name reloadPage
		 * @desc Reload the current page
		 */
		reload: function(){
			system.page.load(system.page.current);
		}
	},
	
	
	user: {
		me: {
			'id':     0,
			'id2':    0,
			'level':  0,
			'active': 0,
			'name':   "",
			'email':  "",
			'token':  "",
			'auth':   ""
		},
		
	
		/**
		 * @name userLogin
		 * @desc Send a request to the API to perform a login request
		 */
		login: function(){

			username = $('#inpLoginName').val();
			userpass = $('#inpLoginPass').val();
			
			if(empty(username) || empty(userpass)){
				$('#outLoginErr').text("Ungültige Zugangsdaten!");
				return false;
			}
			
			hashpass   = $().crypt({method: "md5", source: userpass});
			requestUrl = './src/api/login/'+username+'/'+hashpass+'/';
			
			$.getJSON(requestUrl, function(json){
			
				if(json.error == ""){
				
					system.user.me.id    = json.data['userid'];
					system.user.me.token = json.data['token'];
					system.user.me.auth  = system.user.me.token+"-"+system.user.me.id;
					
					system.popup('close');
					$.cookie("cat_user", system.user.me.auth);
				
					system.user.request(system.user.me.id);
					
				} else {
					$('#outLoginErr').text("Ungültige Zugangsdaten!");
				}
				
			});
		},
		
		/**
		 * @name userLogout
		 * @desc Log out the active user and delete his cookie
		 */
		logout: function(){
			
			requestUrl  = './src/api/logout/';
			requestUrl += (system.user.me.id == 0) ? system.user.me.admauth : system.user.me.auth;
			
			$.getJSON(requestUrl, function(json){
			
				$.cookie("cat_user", null);
				location.reload();
					
			});
		},
		
		/**
		 * @name userRequest
		 * @desc Request all details of the current user
		 */
		request: function(){
		
			requestUrl = './src/api/database/'+system.user.me.auth+'/read/user/id='+system.user.me.id+'/';
			
			$.getJSON(requestUrl, function(json){
				if(json.error == ""){
				
					system.user.me.level = json.data[0]['level'];
					system.user.me.name  = json.data[0]['name'];
					system.user.me.email = json.data[0]['email'];
					
					$('#username').text(system.user.me.name);
					$('nav').css("left", "0");
					
					if(system.user.me.level == 2){
						
						$('#mn_edt').after('<li><i class="icon-shield"></i><a href="page_admin"> Administration</a></li>');
						system.page.load('admin');
						
					} else {
						system.page.load('calendar');
					}
				} else {
					$.cookie("cat_user", null);
					system.popup('login', true);
				}
			});
		}
	},
	
	
	/**
	 * @name loader
	 * @desc Hide or show the data loader
	 * @param {string} action - Loader will show if this is set to 'show', other values will hide it
	 */
	loader: function(action){
	
		if(action == "show") $('#loader').fadeIn('fast');
		else                 $('#loader').fadeOut('fast');
		
	},
	
	
	/**
	 * @name popup
	 * @desc Display or hide a popup and load its content from a HTML file
	 * @param {string} content - The name of the content and its HTML file
	 * @param {boolean} isstatic - Will hide the close button if set to true
	 */
	popup: function(content, isstatic){
	
		if(content != "close"){
		
			$.get('./src/form/'+content+'.html', function(data){
			
				$('#popupcontent').html(data);
				$('#popups').fadeIn('slow');
				
				system.addListener.enterSubmit();
				system.addListener.ajaxLink();
				
				if(isstatic){
					$('#popups').addClass('isstatic');
				} else {
					if($('#popups').hasClass('isstatic')) $('#popups').removeClass('isstatic');
				}
				
			});
			
		} else {
		
			$('#popups').fadeOut('slow', function(){$('#popupcontent').html("")});
			$('#popupcontent').removeClass('isstatic');
			
		}
	},


	addListener: {
		/**
		 * @name enterListener
		 * @desc Add an event listener to catch error presses in input fields
		 */
		enterSubmit: function(){
			$('input').unbind('keyup');
			$('input').keyup(function(key){
				if(key.keyCode == 13){
					$('.popupsubmit').trigger('click');
				}
			});
		},
		
		/**
		 * @name linkListener
		 * @desc Add an event listener to catch linkclicks and handle them via AJAX
		 */
		ajaxLink: function(){
		
			$('a').unbind('click');
			$('a').click(function(e){
				system.page.locked = true;
				
				link   = $(this).attr('href');
				parts  = link.split('_');
				type   = parts[0];
				target = parts[1];
				
				if(parts[2] !== undefined){
					system.data = parts[2];
				}
				
				switch(type){
					case "page":
						if(system.page.current != target){
							$('.userelement').removeClass('active');
							$(this).parent().addClass('active');
							
							system.page.load(target);
						}
						break;
					case "popup":
						system.popup(target, false);
						break;
					case "action":
						func = window["action_"+target];
						func();
						break;
				}
				
				e.preventDefault();
			});
		}
	}
}


/**
 * Seiteninitialisierung
 *
 * Wird beim Aufruf der Seite verwendet um
 * uU eine Anmeldeabfrage anzuzeigen oder den
 * Benutzer-Token aus eine cookie zu lesen.
 */
$(document).ready(function(){
	if($.cookie("cat_user") == undefined){
		
		system.loader('show');
		system.popup('login', true);
		system.loader('hide');
		
	} else {
	
		usercookie = $.cookie("cat_user");
		userparts  = usercookie.split("-");
		
		system.user.me.token = userparts[0];
		system.user.me.id    = userparts[1];
		system.user.me.auth  = usercookie;
		
		system.user.request(userparts[1]);
		
	}
	
	system.addListener.ajaxLink();
	
	/* Event listener: AJAX Error handler */
	$(document).ajaxError(function(){
		system.handleError("Anfrageziel konnte nicht gefunden werden.");
	});
	
	/* Event listener: Benutzermenu slide toggle */
	$('#userfieldVisible').click(function(){
		$('#userfieldHidden').slideToggle('fast');
		$('#userfieldIcon').toggleClass('userfieldIconRotate');
	});
	
	/* Verfügbare Kalenderkategorien laden * /
	$.get('./src/api/database/'+user.auth+'/read/subject/deleted="0"', function(json){
		
		subjectAmount = json.data.length;
		
		while(subjectAmount--){
			system.subj[json.data[subjectAmount]['id']] = json.data[subjectAmount]['name'];
		}
			
	}); */
});




/**
 * @name miscChDate
 * @desc Generate our default date format out of the YYYY-MM-DD syntax
 * @param {string} date - Date in the YYYY-MM-DD format
 * @return {string} Date in the DD.MM.YYYY format
 */
function chdate(date){
	
	parts = date.split("-");
	return parts[2]+"."+parts[1]+"."+parts[0];
	
}

/**
 * @name miscGetDate
 * @desc Generate current date in the YYYY-MM-DD format
 * @return {string} Date in the YYYY-MM-DD format
 */
function now(){
	return (new Date()).toISOString().substring(0, 10);
}

/**
 * @name miscCheckEmpty
 * @desc Check if the given string is empty
 * @param {string} string - The input string to check
 * @return {boolean} Returns true if the input string was empty
 */
function empty(string){
	return (string === "") ? true : false;
}


/* Placeholder and unused functions */
function pageinit_help(){ system.page.append(); }
function action_logout(){ system.user.logout(); }