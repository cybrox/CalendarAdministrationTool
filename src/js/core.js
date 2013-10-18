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
	'page': "unknown",
	'data': "",
	'subj': {}
}

/**
 * Benutzerobjekt
 */
var user = {
	'id':     0,
	'level':  0,
	'active': 0,
	'name':   "",
	'email':  "",
	'token':  "",
	'auth':   ""
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
		
		$.loader('show');
		$.popup('login', true);
		$.loader('hide');
		
	} else {
		usercookie = $.cookie("cat_user");
		userparts  = usercookie.split("-");
		user.token = userparts[0];
		user.id    = userparts[1];
		user.auth  = usercookie;
		
		requestUserdata(user.id);
	}
	
	loadAllSubjects();
	createLinkListener();
});
 

/**
 * Fehleranzeige zur Benutzerinformation
 *
 * Bei einem AJAX Fehler wird dem Benutzer
 * automatisch eine Fehlermeldung ausgegeben
 */
$.error = function(message){

	$('#errormsg').text(message);
	$('#errors').fadeIn();

}
 
 
/**
 * Popups zur Darstellung von On-Site Formularen
 *
 * Alle Aktionen im Kalendertool werden direkt
 * auf der Seite ausgeführt auf der sie aufgerufen
 * wurden, indem sie in ein Popup ausgelagert werden.
 */
$.popup = function(content, isstatic){
	if(content != "close"){
		$.ajax({
			type: 'GET',
			url: './src/form/'+content+'.html',
			success: function(data){
				$('#popupcontent').html(data);
				createEnterListener();
				createLinkListener();
			},
			error: function() {
				$.error("Formular \""+content+"\" konnte nicht geladen werden");
			}
		});
		$('#popups').fadeIn('slow');
		if(isstatic){
			$('#popups').addClass('isstatic');
		} else {
			if($('#popups').hasClass('isstatic')){
				$('#popups').removeClass('isstatic');
			}
		}
	} else {
		$('#popups').fadeOut('slow', function(){$('#popupcontent').html("")});
		$('#popupcontent').removeClass('isstatic');
	}
	
}
 
 
/**
 * AJAX Loader für Ladeanzeige
 *
 * Beim laden einer neuen Seite oder neuen
 * Inhalten für die aktive Seite wird dem
 * Benutzer mittels einer Ladeanzeige suggeriert
 * zu warten. Diese wird hier generiert.
 */
$.loader = function(action){
	if(action == "show"){
		$('#loader').fadeIn('fast');
	} else {
		$('#loader').fadeOut('fast');
	}
}


/**
 * Formulare per Enter absenden
 *
 * Fügt einen listener zu input Feldern
 * hinzu um Formulare mit einem Enter
 * druck abzusenden.
 */
function createEnterListener(){
	$('input').unbind('keyup');
	$('input').keyup(function(key){
		if(key.keyCode == 13){
			$('.popupsubmit').trigger('click');
		}
	});
}


/**
 * Linkfunktionen ersetzen
 *
 * Linkklicks werden abgefangen um ihre
 * Aktionen direkt weiterzuverarbeiten und
 * zb. Seiten per AJAX ins DOM zu laden.
 */
function createLinkListener(){
	$('a').unbind('click');
	$('a').click(function(e){
		
		link   = $(this).attr('href');
		parts  = link.split('_');
		type   = parts[0];
		target = parts[1];
		
		if(parts[2] !== undefined){
			system.data = parts[2];
		}
		
		switch(type){
			case "page":
				$('.userelement').removeClass('active');
				$(this).parent().addClass('active');
				
				loadPage(target);
				break;
			case "popup":
				$.popup(target, false);
				break;
			case "action":
				func = window[target];
				func();
				break;
		}
		
		e.preventDefault();
	});
}


/**
 * Einbinden einer Seite in das DOM
 *
 * Lädt eine Seite via AJAX in das DOM
 * des Kalendertools.
 */
function loadPage(target){
	system.page = target;

	$.loader('show');
	$.ajax({
		type: 'GET',
		url: './src/page/'+target+'.html',
		success: function(data){
			$('#contentInner').hide();
			$('#contentInner').html("");
			$('#contentInner').html(data);

			func = window["pageinit_"+target];
			func();
	
			createLinkListener();
		},
		error: function() {
			$.error("Seiteninhalt \""+target+"\" konnte nicht geladen werden");
		}
	});
}


/**
 * Neu geladene Seite in DOM einbinden
 *
 * Bindet die zuvor geladene Seite nach
 * Abschluss der Init funktion ins DOM
 * ein und blendet den loader aus.
 */
function appendPage(){
	$.loader('hide');
	$('#contentInner').fadeIn('fast');
}


/**
 * Seite neu laden
 *
 * Erlaubt das neuladen einer Seite
 * durch erneutes aufrufen der pageinit
 * Funktion und erneutem einbetten in das DOM
 */
function reloadPage(){
	loadPage(system.page);
}


/**
 * Userpanel, Steuerung des Benutzermenus
 *
 * Durch einen Klick auf den Benutzernamen kann der
 * Benutzer das Menu aufrufen, dabei wird der versteckte
 * Container per slideToggle langsam eingeblendet
 */
$('#userfieldVisible').click(function(){
	$('#userfieldHidden').slideToggle('fast');
	
	$('#userfieldIcon').toggleClass('userfieldIconRotate');
});


/**
 * Anmeldefnuktion, Benutzer anmelden
 *
 * Beim absenden der Anmeldung wird eine
 * Anfrage an die Schnittstelle gesendet und
 * die Benutzerdatan abgefragt, im erfolgsfall
 * wird auf das Kalenderinterface gewechselt
 */
function submitLogin(){

	username = $('#inpLoginName').val();
	userpass = $('#inpLoginPass').val();

	hashpass = $().crypt({method: "md5", source: userpass});
	
	$.ajax({
		type: 'GET',
		url: './src/api/login/'+username+'/'+hashpass+'/',
		dataType: 'json',
		success: function(json){
			if(json.error == ""){
				user.id    = json.data['userid'];
				user.token = json.data['token'];
				user.auth  = user.token+"-"+user.id;
				
				$.popup('close');
				$.cookie("cat_user", user.auth);
			
				requestUserdata(user.id);
			} else {
				$('#outLoginErr').text("Ungültige Zugangsdaten!");
			}
		},
		error: function() {
			$.error("Benutzerauthentifizierung konnte nicht geladen werden");
		}
	});
}


/**
 * Benutzerdaten anfordern
 */
function requestUserdata(){
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/read/user/id='+user.id+'/',
		dataType: 'json',
		success: function(json){
			if(json.error == ""){
				user.level = json.data[0]['level'];
				user.name  = json.data[0]['name'];
				user.email = json.data[0]['email'];
				
				$('#username').text(user.name);
				$('nav').css("left", "0");
				
				$('.userelement a').first().click();
			} else {
				$.cookie("cat_user", null);
				$.popup('login', true);
			}
		},
		error: function() {
			$.error("Benutzerdaten konnten nicht geladen werden");
		}
	});
}


/**
 * Abmelden, Cookie löschen
 *
 * Beim Abmelden wird der Benutzer in der
 * Datenbank abgemeldet und zusätzlich das
 * im Browser gespeicherte Cookie gelöscht.
 */
function logout(){
	$.ajax({
		type: 'GET',
		url: './src/api/logout/'+user.auth,
		dataType: 'json',
		success: function(){
			$.cookie("cat_user", null);
			location.reload();
		}
	});
}




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
 * Alle Terminkategorien laden
 *
 * Lädt bei initialisierung des CAT
 * alle verfügbaren Terminkategorien.
 */
function loadAllSubjects(){
	
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/read/subject/deleted="0"',
		dataType: 'json',
		success: function(json){
		
			subjectAmount = json.data.length;
			
			while(subjectAmount--){
				system.subj[json.data[subjectAmount]['id']] = json.data[subjectAmount]['name'];
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
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
 function pageinit_help(){ appendPage(); }