/* CAT - Calendar Administration Tool
** Cascading Style Sheet, Hauptstyle
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
	
	var userType = (user.level == 2) ? "Administrator" : "Normaler Benutzer";
	
	$('#editDataUserId').text("#"+user.id);
	$('#editDataUsername').text(user.name);
	$('#editDataUsertype').text(userType);
	
	$('#editDataUsermail').val(user.email);
	
	createEnterListener();
		
	appendPage();
}


/**
 * Speichern der Kontoinformationen
 *
 * Diese Funktion wird beim absenden der
 * Kontoverwaltung aufgerufen, sie speichert
 * die eingegebenen Informationen in der
 * Datenbank.
 */
function submitEdit(){
	
	usermail = $('#editDataUsermail').val();
	userpass = $('#editDataUserpass').val();
	userpas2 = $('#editDataUserpassRep').val();
	
	uservalid = true;
	
	requesturl = './src/api/database/'+user.auth+'/write/user/id='+user.id+'/update/`email` = "'+usermail+'"';
	
	if(userpass !== ""){
		
		if(userpass !== userpas2){
			$('#successEdit').empty();
			$('#errorEdit').text("Die eingegebenen Passwörter stimmen nicht überein.");
			
			uservalid = false;
		}
		
		hashpass = $().crypt({method: "md5", source: userpass});
	
		requesturl += ', `password` = "'+hashpass+'"';
	}
	
	if(uservalid){
		$.ajax({
			type: 'GET',
			url: requesturl,
			dataType: 'json',
			success: function(json){
				$('#errorEdit').empty();
				$('#successEdit').text("Änderungen erfolgreich gespeichert.");
			},
			error: function() {
				$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
			}
		});
	}

}