/* CAT - Calendar Administration Tool
** Benutzerprofilverwaltung
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/

/**
 * Initialisierung der edit Seite
 *
 * Wird verwendet um die Daten des
 * aktiven Benutzers anzuzeigen.
 */
function pageinit_edit(){
	
	var userType = (system.user.me.level == 2) ? "Administrator" : "Normaler Benutzer";
	
	$('#editDataUserId').text("#"+system.user.me.id);
	$('#editDataUsername').text(system.user.me.name);
	$('#editDataUsertype').text(userType);
	
	$('#editDataUsermail').val(system.user.me.email);
	
	system.addListener.enterSubmit();
	system.page.append();
}


var edit = {
	/**
	 * Speichern der Kontoinformationen
	 *
	 * Diese Funktion wird beim absenden der
	 * Kontoverwaltung aufgerufen, sie speichert
	 * die eingegebenen Informationen in der
	 * Datenbank.
	 */
	submit: function(){
		
		usermail = $('#editDataUsermail').val();
		userpass = $('#editDataUserpass').val();
		userpas2 = $('#editDataUserpassRep').val();
		
		uservalid = true;
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/id='+system.user.me.id+'/update/`email` = "'+usermail+'"';
		
		if(userpass !== ""){
			
			if(userpass !== userpas2){
				$('#successEdit').empty();
				$('#errorEdit').text("Die eingegebenen Passwörter stimmen nicht überein.");
				
				uservalid = false;
			}
			
			hashpass = $().crypt({method: "md5", source: userpass});
		
			requestUrl += ', `password` = "'+hashpass+'"';
		}
		
		if(uservalid){
			$.getJSON(requestUrl, function(json){
			
				console.log(json);
			
				$('#errorEdit').empty();
				$('#successEdit').text("Änderungen erfolgreich gespeichert.");
					
			});
		}

	}
}