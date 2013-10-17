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
	
}

function submitEdit(){
	
	usermail = $('#editDataUsermail').val();
	userpass = $('#editDataUserpass').val();
	
	requesturl = './src/api/database/'+user.auth+'/write/user/id='+user.id+'/update/`email` = "'+usermail+'"';
	
	if(userpass !== ""){
		requesturl += ', `password` = "'+userpass+'"';
	}
	
	console.log(requesturl);
	
	$.ajax({
		type: 'GET',
		url: requesturl,
		dataType: 'json',
		success: function(json){
			$('#successEdit').text("Änderungen erfolgreich gespeichert.");
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});

}