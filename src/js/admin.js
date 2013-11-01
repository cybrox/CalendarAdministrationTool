/* CAT - Calendar Administration Tool
** Administrative funktionen
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/


function pageinit_admin(){

	admin.getAllUser();
	admin.getAllSubjects();
	
	system.page.append();

}


var admin = {
	/**
	 * Alle Benutzer auslesen
	 */
	getAllUser: function(){
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/read/user/1=1';
		
		$.getJSON(requestUrl, function(json){
			if(json.error == ""){
			
				usercount = json.data.length;
				while(usercount--){
				
					val = json.data[usercount];
					
					userstring  = '<div class="listp"><i class="icon-user"></i> <span>'+val['name']+'</span><div class="options">';
					userstring += '<a class="button tooltip" href="popup_useredit_'+val['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a>';
					userstring += '<a class="button tooltip" href="popup_userdelete_'+val['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a></div><div class="break"></div></div>';
				
					$('#userContent').append(userstring);
				}
				
				system.addListener.ajaxLink();
				
			} else {
				$('#userContent').html("Keine Benutzer gefunden.");
			}
			
		});
	},
	
	
	/**
	 * Alle Kalenderkategorien laden
	 *
	 * Diese Funktion lädt alle Kalender-
	 * kategorien für das Admininterface
	 */
	getAllSubjects: function(){

		requestUrl = './src/api/database/'+system.user.me.auth+'/read/subject/1=1';
				
		$.getJSON(requestUrl, function(json){
			if(json.error == ""){
			
				subjectcount = json.data.length;
				while(subjectcount--){
				
					val = json.data[subjectcount];
					
					subjectstring  = '<div class="listp"><i class="icon-tag"></i> <span>'+val['name']+'</span><div class="options">';
					subjectstring += '<a class="button tooltip" href="popup_subjectedit_'+val['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a>';
					subjectstring += '<a class="button tooltip" href="popup_subjectdelete_'+val['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a></div><div class="break"></div></div>';
				
					$('#subjectContent').append(subjectstring);
				}
				
				system.addListener.ajaxLink();
				
			} else {
				$('#subjectContent').html("Keine Kategorien gefunden.");
			}
		});
	},
	
	
	addUser: function(){
	
		var username = $('#inpUsrName').val();
		var usermail = $('#inpUsrMail').val();
		var userpass = $('#inpUsrPass').val();
		var usergrou = $('#inpUsrGrou').val();
		
		if(!empty(username) && !empty(usermail) && !empty(userpass)){
		
			hashpass = $().crypt({method: "md5", source: userpass});
		
			requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/1/insert/`name`="'+username+'", `password`="'+hashpass+'", `email`="'+usermail+'", `level`="'+usergrou+'"';
				
			$.getJSON(requestUrl, function(json){
			
				if(json.status == 4){
					system.page.reload();
				} else {
					$('#errorUserAdd').text("Konnte Benutzer nicht hinzufügen.");
				}
			});
		
		} else {
			$('#errorUserAdd').text("Bitte füllen Sie alle Felder aus.");
		}
	}
}