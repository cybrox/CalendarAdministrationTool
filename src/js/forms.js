/* CAT - Calendar Administration Tool
** Cascading Style Sheet, Hauptstyle
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/



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

	$.ajax({
		type: 'GET',
		url: './src/api/login/'+username+'/'+userpass+'/',
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