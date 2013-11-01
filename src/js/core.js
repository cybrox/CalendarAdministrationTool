/* CAT - Calendar Administration Tool
** Kernfunktionen, Loginverwaltung
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/


/**
 * Systemobjekt
 */
var system = {
	'data': "",
	
	
	/**
	 * Fehleranzeige zur Benutzerinformation
	 *
	 * Bei einem AJAX Fehler wird dem Benutzer
	 * automatisch eine Fehlermeldung ausgegeben
	 */
	handleError: function(message){
		$('#errormsg').text(message);
		$('#errors').fadeIn();
	},
	
	
	page: {
		current: "",
		locked:  false,
	
		/**
		 * Einbinden einer Seite in das DOM
		 *
		 * Lädt eine Seite via AJAX in das DOM
		 * des Kalendertools.
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
		 * Neu geladene Seite in DOM einbinden
		 *
		 * Bindet die zuvor geladene Seite nach
		 * Abschluss der Init funktion ins DOM
		 * ein und blendet den loader aus.
		 */
		append: function(){
		
			system.loader('hide');
			$('#contentInner').fadeIn('fast');
			
		},
		
		
		/**
		 * Seite neu laden
		 *
		 * Erlaubt das neuladen einer Seite
		 * durch erneutes aufrufen der pageinit
		 * Funktion und erneutem einbetten in das DOM
		 */
		reload: function(){
			system.page.load(system.page.current);
		}
	},
	
	
	user: {
		me: {
			'id':     0,
			'level':  0,
			'active': 0,
			'name':   "",
			'email':  "",
			'token':  "",
			'auth':   ""
		},
		
	
		/**
		 * Anmeldefnuktion, Benutzer anmelden
		 *
		 * Beim absenden der Anmeldung wird eine
		 * Anfrage an die Schnittstelle gesendet und
		 * die Benutzerdatan abgefragt, im erfolgsfall
		 * wird auf das Kalenderinterface gewechselt
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
		 * Abmelden, Cookie löschen
		 *
		 * Beim Abmelden wird der Benutzer in der
		 * Datenbank abgemeldet und zusätzlich das
		 * im Browser gespeicherte Cookie gelöscht.
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
		 * Benutzerdaten anfordern
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
					
						system.user.me.id      = "0";
						system.user.me.admauth = system.user.me.auth;
						
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
	 * AJAX Loader für Ladeanzeige
	 *
	 * Beim laden einer neuen Seite oder neuen
	 * Inhalten für die aktive Seite wird dem
	 * Benutzer mittels einer Ladeanzeige suggeriert
	 * zu warten. Diese wird hier generiert.
	 */
	loader: function(action){
	
		if(action == "show") $('#loader').fadeIn('fast');
		else                 $('#loader').fadeOut('fast');
		
	},
	
	
	/**
	 * Popups zur Darstellung von On-Site Formularen
	 *
	 * Alle Aktionen im Kalendertool werden direkt
	 * auf der Seite ausgeführt auf der sie aufgerufen
	 * wurden, indem sie in ein Popup ausgelagert werden.
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


	/**
	 * Formulare per Enter absenden
	 *
	 * Fügt einen listener zu input Feldern
	 * hinzu um Formulare mit einem Enter
	 * druck abzusenden.
	 */
	addListener: {
		enterSubmit: function(){
			$('input').unbind('keyup');
			$('input').keyup(function(key){
				if(key.keyCode == 13){
					$('.popupsubmit').trigger('click');
				}
			});
		},
		
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
 * Datum richtig darstellen
 *
 * Erzeugt einen Datumsstring im Format dd.mm.yyyy
 * aus dem verwendeten yyyy-mm-dd stringformat.
 */
function chdate(date){
	
	parts = date.split("-");
	return parts[2]+"."+parts[1]+"."+parts[0];
	
}


/**
 * Heutiges Datum generieren
 *
 * Generiert einen String für das
 * heutige Datum im yyyy-mm-dd format.
 */
function now(){
	return (new Date()).toISOString().substring(0, 10);
}


/**
 * Vollständigkeitsprüfung
 *
 * Prüft ob der übergebene String
 * leer ist.
 */
function empty(string){
	return (string === "") ? true : false;
}


/**
 * Name einer Terminkategorie auslesen
 *
 * Gibt den namen einer Terminkategorie
 * basierend auf der eingegebenen ID zurück.
 */
function getSubjectById(id){
	return system.subj[id];
}


/**
 * Ungenutzte "init" funktionen
 */
function pageinit_help(){ system.page.append(); }
function action_logout(){ system.user.logout(); }