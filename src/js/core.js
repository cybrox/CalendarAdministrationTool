/* CAT - Calendar Administration Tool
** Cascading Style Sheet, Hauptstyle
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/


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
		$.popup('login');
		$.loader('hide');
		
	} else {
		usercookie = $.cookie("cat_user");
		userparts  = usercookie.split("-");
		user.token = userparts[0];
		user.id    = userparts[1];
		user.auth  = usercookie;
		
		requestUserdata(user.id);
	}
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
$.popup = function(content){
	
	if(content != "close"){
		$.ajax({
			type: 'GET',
			url: './src/form/'+content+'.html',
			success: function(data){
				$('#popupcontent').html(data);
			},
			error: function() {
				$.error("Formular \""+content+"\" konnte nicht geladen werden");
			}
		});
		$('#popups').fadeIn('slow');
	} else {
		$('#popups').fadeOut('slow', function(){$('#popupcontent').html("")});
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
 * Linkfunktionen ersetzen
 *
 * Linkklicks werden abgefangen um ihre
 * Aktionen direkt weiterzuverarbeiten und
 * zb. Seiten per AJAX ins DOM zu laden.
 */
$('a').click(function(e){
	
	$.loader('show');
	
	link   = $(this).attr('href');
	parts  = link.split('_');
	type   = parts[0];
	target = parts[1];
	
	switch(type){
		case "page":
			$('.userelement').removeClass('active');
			$(this).parent().addClass('active');
			
			$.ajax({
				type: 'GET',
				url: './src/page/'+target+'.html',
				success: function(data){
					$('#contentInner').hide();
					$('#contentInner').html(data);
					$('#contentInner').fadeIn('fast');
					
					func = window["pageinit_"+target];
					func();
					
					$.loader('hide');
				},
				error: function() {
					$.error("Seiteninhalt \""+target+"\" konnte nicht geladen werden");
				}
			});
			break;
		case "popup":
			$.popup(target);
			break;
		case "action":
			func = window[target];
			func();
			break;
	}
	
	e.preventDefault();
});


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






