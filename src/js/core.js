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
	'data':    "",	// Temporary storage for data parameter on button clicks
	'subject': [],	// List of arrays with all calendar subjects
	
	
	/**
	 * @name handleError
	 * @desc Handle any error that may occur
	 * @param {string} message - The error mesage the system will output
	 */
	handleError: function(message){
		system.loader("hide");
		$('#errormsg').text(message);
		$('#errors').fadeIn();
	},
	
	
	page: {
		current: "",
		locked:  false,
		
		/**
		 * @name checkPage
		 * @desc Check if url contains a page hash and load the given site
		 */
		check: function(){
			var pagehash = window.location.hash.replace("#", "");
			
			if(empty(pagehash)) return false;
			
			system.page.load(pagehash);
			return true;
		},
	
		/**
		 * @name loadPage
		 * @desc Load the selected page from its HTML file via AJAX request
		 * @param {string} target - Name of the page and its HTML file to load
		 */
		load: function(target){
		
			window.location.hash = target;
			system.page.current  = target;
			system.popup.hide();
			
			/* Additional security check for administrator page */
			if(target == "admin"){
				requestUrl = "./src/api/database/"+system.user.me.auth+"/read/user/id="+system.user.me.id+"/";
				$.getJSON(requestUrl, function(json){
					if(json.data[0]['level'] == 2){
						system.page.loadContent(target);
					} else {
						system.handleError("Sie verfügen nicht über die notwendigen Berechtigungen diese Aktion durchzuführen");
						return;
					}
				});
			} else {
				system.page.loadContent(target);
			}
		},
		
		/**
		 * @name loadPageContent
		 * @desc Load the page's content after the security check
		 * @param {string} target - the page to load
		 */
		loadContent: function(target){
			$.get("./src/page/"+target+".html", function(data){
			
				$('#mm_'+target).addClass("active");
				$('#contentInner').hide().empty().html(data);
				
				if(system.user.me.help == "1") $(".help").css("display", "block");
				
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
			$('#contentInner').fadeIn('fast');
		},
		
		/**
		 * @name parsePage
		 * @desc Writes content smoothly into DOM
		 * @param {string} target - The target container 
		 * @param {DOM} content - The container content
		 */
		parse: function(target, content){
			output = $("#"+target);
			output.animate({"opacity": "0"}, 150, function(){
				output.html(content).animate({"opacity": "1"}, 150);
			});
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
			'help':   0,
			'active': 0,
			'name':   "",
			'email':  "",
			'token':  "",
			'auth':   ""
		},
		
	
		/**
		 * @name userLogin
		 * @desc Send a request to the API to perform a login request
		 * @param {string} username - The user's name
		 * @param {string} userpass - The user's password
		 */
		login: function(username, userpass){
		
			if(empty(username) || empty(userpass)){
				system.form.output("login", "error", "Ungültige Zugangsdaten!");
				return;
			}
			
			hashpass   = $().crypt({method: "md5", source: userpass});
			requestUrl = './src/api/login/'+username+'/'+hashpass+'/';
			$.getJSON(requestUrl, function(json){
				if(json.error == ""){
				
					system.user.me.id    = json.data['userid'];
					system.user.me.token = json.data['token'];
					system.user.me.help  = json.data['help'];
					system.user.me.auth  = system.user.me.token+"-"+system.user.me.id;
					
					system.popup.hide();
					$.cookie("cat_user", system.user.me.auth);
				
					system.initialize();
					
				} else {
					system.form.output("login", "error", "Ungültige Zugangsdaten!");			
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
				window.location.hash = "";
				$.cookie("cat_user", null);
				location.reload();				
			});
		},
		
		/**
		 * @name userRequest
		 * @desc Request all details of the current user
		 * @param {boolean} redirect - Indicator wether the system should redirect the user or not
		 */
		request: function(redirect){
		
			requestUrl = './src/api/database/'+system.user.me.auth+'/read/user/id='+system.user.me.id+'/';
			
			$.getJSON(requestUrl, function(json){
				if(json.error == ""){
				
					system.user.me.level = json.data[0]['level'];
					system.user.me.email = json.data[0]['email'];
					system.user.me.name  = json.data[0]['name'];
					system.user.me.help  = json.data[0]['help'];
					
					$('#username').text(system.user.me.name);
					$('nav').css("left", "0");
					
					if(system.user.me.level == 2 && $("#mn_adm").length == 0) $('#mn_edt').after('<li id="mn_adm"><i class="icon-shield"></i><a href="page_admin"> Administration</a></li>');
					
					if(redirect){
						if(!system.page.check()){
							if(system.user.me.level == 2) system.page.load('admin');
							else system.page.load('calendar');
						}
					}
				} else {
					$.cookie("cat_user", null);
					system.popup.show('login', true);
				}
			});
		},
		
		/**
		 * @name userEdit
		 * @desc Submit the profile form and save the informations in the database
		 * @param {string} usermail - The user's E-Mail adress
		 * @param {string} userpass - The user's new password
		 * @param {string} userpas2 - Same as "userpass"
		 * @param {string} userhelp - Display help messages settings
		 */
		edit: function(usermail, userpass, userpas2, userhelp){
			uservalid = true;
			userhelp  = (userhelp == true) ? "1" : "0";
			
			requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/id='+system.user.me.id+'/update/`email` = "'+usermail+'", `help` = "'+userhelp+'"';
			
			if(userpass !== ""){
				if(userpass !== userpas2){
					system.form.output("edit", "error", "Die eingegebenen Passwörter stimmen nicht überein.");			
					uservalid = false;
				}		
				hashpass = $().crypt({method: "md5", source: userpass});
				requestUrl += ', `password` = "'+hashpass+'"';
			}
			
			if(uservalid){
				$.getJSON(requestUrl, function(json){
					system.form.output("edit", "success", "Änderungen erfolgreich gespeichert.");
					system.user.request(false);
				});
			}

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
	
	popup: {
	
		/**
		 * @name showPopup
		 * @desc Display or hide a popup and load its content from a HTML file
		 * @param {string} content - The name of the content and its HTML file
		 * @param {boolean} isstatic - Will hide the close button if set to true
		 */
		show: function(content, isstatic){
			$.get('./src/form/'+content+'.html', function(data){
				
				$('#popupcontent').html(data);
				$('#popups').fadeIn('slow');
				
				system.addListener.enterSubmit();
				
				if(isstatic){
					$('#popups').addClass('isstatic');
				} else {
					if($('#popups').hasClass('isstatic')) $('#popups').removeClass('isstatic');
				}
				
			});
		},
		
		/**
		 * @name hidePopup
		 * @desc Display or hide a popup and load its content from a HTML file
		 * @param {string} content - The name of the content and its HTML file
		 * @param {boolean} isstatic - Will hide the close button if set to true
		 */
		hide: function(){
			$('#popups').fadeOut('slow', function(){$('#popupcontent').html("")});
			$('#popupcontent').removeClass('isstatic');
		}
	},

	
	form: {
		/**
		 * @name formOutput
		 * @desc Output a message in a form with a smooth 150ms delay
		 * @param {string} form - Name of the form to output message
		 * @param {string} type - Can be "error" or "success"
		 * @param {string} message - The message to display
		 */
		output: function(form, type, message){
			var outtyp = (type.toLowerCase() == "success") ? "Error" : "Success";
			var notput = $("#form"+ucfirst(form)+ucfirst(outtyp));
			var output = $("#form"+ucfirst(form)+ucfirst(type));

			output.animate({"opacity": "0"}, 150, function(){
				output.text(message).animate({"opacity": "1"}, 150);
				notput.empty();
			});
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
		
			var links = $('a').not(".ui-datepicker-prev").not(".ui-datepicker-next");
		
			links.unbind('click')
			.click(function(e){
				var validLink = system.addListener.handleLink($(this).attr('href'));
				if(validLink) e.preventDefault();
			});
		},
		
		/**
		 * @name handleLink
		 * @desc Handle the AJAX links
		 * @param {string} target - The link target (href attribute)
		 * @return {boolean} return true if link was valid
		 */
		handleLink: function(target){
			system.page.locked = true;
			
			if(!empty(target)){
				targetParts  = target.split('_');
				targetType   = targetParts[0];
				target       = targetParts[1];
				if(targetParts[2] !== undefined) system.data = targetParts[2];
			} else {
				return false;
			}
			
			switch(targetType){
				case "page":
					if(system.page.current != target){
						$('.userelement').removeClass('active');
						$(this).parent().addClass('active');
						
						system.page.load(target);
					}
					break;
				case "popup":
					system.popup.show(target, false);
					break;
				case "action":
					func = window["action_"+target];
					func();
					break;
			}
			
			return true;
		}
	},
	
	
	/**
	 * @name initialize
	 * @desc Load everything needed to run.
	 */
	initialize: function(){
		jQuery(function($){$.datepicker.regional['de'] = {
				prevText:   "<i class=\"icon-angle-left\"></i>",
				prevStatus: "Letzten Monat anzeigen",
				nextText:   "<i class=\"icon-angle-right\"></i>",
				nextStatus: "Nächsten Monat anzeigen",
				
				dayNamesMin:   ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
				dayNamesShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
				dayNames:      ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
				
				monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
				monthNames:      ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ],
				
				firstDay: 1
			};
			$.datepicker.setDefaults($.datepicker.regional['de']);
		});
		
		$.getJSON('./src/api/database/'+system.user.me.auth+'/read/subject/deleted="0"', function(json){
			
			subjectAmount = json.data.length;
			while(subjectAmount--){
				system.subject.push(json.data[subjectAmount]);
			}
			
			system.user.request(true);
				
		});
	}
}


/**
 * Page initializing
 *
 * Will be called when the page DOM is
 * loaded and ready to use.
 */
$(document).ready(function(){

	/* Check if user has an existing session cookie */
	if($.cookie("cat_user") == "null" || $.cookie("cat_user") == undefined){	
		system.loader('show');
		system.popup.show('login', true);
		system.loader('hide');	
	} else {
		usercookie = $.cookie("cat_user");
		userparts  = usercookie.split("-");
		
		system.user.me.token = userparts[0];
		system.user.me.id    = userparts[1];
		system.user.me.auth  = usercookie;
		
		system.initialize();
	}
	
	/* Event listener: Handle AJAX events */
	$(document).ajaxSend(function(){ system.loader("show"); });
	$(document).ajaxStop(function() { system.loader("hide"); });
	$(document).ajaxError(function(){ system.handleError("Anfrageziel konnte nicht gefunden werden."); });
	
	/* Event listener: Usermenu slide toggle */
	$('#userfieldVisible').click(function(){
		$('#userfieldHidden').slideToggle('fast');
		$('#userfieldIcon').toggleClass('userfieldIconRotate');
	});
});




/**
 * @name miscGetCategoryById
 * @desc Get a categories name by its ID
 * @param {int} id - The unique id of the requested category
 * @return {string} The name of the requested category
 */
function getSubjectById(id){
	var subjectamount = system.subject.length;
	while(subjectamount--){
		if(system.subject[subjectamount]['id'] == id){
			return system.subject[subjectamount]['name'];
		}		
	}
	return "Allgemeines";	// Default value for unknown category
}

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
 * @name miscAfter
 * @desc Check if a given date string comes after today in time order
 * @param {string} data - the date to check
 * @return {boolean} Indicator if the check returned true / false
 */
function after(date){
	var datenow = now().split("-");
	var datechk = date.split("-");
	
	if(datechk[0] == datenow[0] && datechk[1] == datenow[1] && datechk[2] > datenow[2]) return true;
	if(datechk[0] == datenow[0] && datechk[1] >  datenow[1]) return true;
	if(datechk[0] >  datenow[0]) return true;
	
	return false;
}

/**
 * @name miscCheckEmpty
 * @desc Check if the given string is empty
 * @param {string} string - The input string to check
 * @return {boolean} Returns true if the input string was empty
 */
function empty(string){
	return (string === "" || string == undefined) ? true : false;
}


/**
 * @name miscUcfirst
 * @desc Capitalize the first letter of a string
 * @param {string} string - The string to edit
 */
function ucfirst(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}


/* Placeholder and unused functions */
function pageinit_help(){ system.page.append(); }
function action_logout(){ system.user.logout(); }


/* Pageinit for user edit page */
function pageinit_edit(){
	
	var userType = (system.user.me.level == 2) ? "Administrator" : "Normaler Benutzer";
	var userHelp = (system.user.me.help !== "0") ? true : false;
	
	$('#editDataUserId').text("#"+system.user.me.id);
	$('#editDataUsername').text(system.user.me.name);
	$('#editDataUsertype').text(userType);
	
	$('#editDataUsermail').val(system.user.me.email);
	$("#editDataUserhelp").attr("checked", userHelp);
	
	system.addListener.enterSubmit();
	system.page.append();
}