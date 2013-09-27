/* CAT - Calendar Administration Tool
** Cascading Style Sheet, Hauptstyle
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/

function submitLogin(){
	username = $('#inpLoginName').val();
	userpass = $('#inpLoginPass').val();
	
	console.log('./src/api/login/'+username+'/'+userpass+'/');
	
	$.ajax({
		type: 'GET',
		url: './src/api/login/'+username+'/'+userpass+'/',
		dataType: 'json',
		success: function(json){
			console.log(json);
			if(json.error == ""){
				user.id    = json.data['userid'];
				user.token = json.data['token'];
				
				$.cookie("cat_user", user.token+"_"+user.id);
				
				console.log(user);
			} else {
				$('#outLoginErr').text("Ungültige Zugangsdaten!");
			}
		},
		error: function() {
			$.error("Formular \""+content+"\" konnte nicht geladen werden");
		}
	});
}