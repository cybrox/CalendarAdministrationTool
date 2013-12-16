/* CAT - Calendar Administration Tool
** Administrative methods
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/


/**
 * @name pageinitAdmin
 * @desc Initialize the admin page, load all users and subjects
 */
function pageinit_admin(){

	admin.user.loadAll();
	admin.getAllSubjects();
	
	system.page.append();

}


/**
 * @namespace Admin
 * @name Admin
 * @desc Administrative methods
 */
var admin = {
	
	/**
	 * @name subjectsRequestAll
	 * @desc Request all subjects and generate a list on the admin page
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
	
	user: {
		/**
		 * @name userLoadAll
		 * @desc Request all users and generate a list on the admin page
		 */
		loadAll: function(){
			
			requestUrl = './src/api/database/'+system.user.me.auth+'/read/user/deleted = 0';
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
		 * @name userLoadOne
		 * @desc Load a single user's data to the edit form
		 * @param {int} userid - The respective user's id
		 */
		loadOne: function(userid){
			requestUrl = './src/api/database/'+system.user.me.auth+'/read/user/id='+userid;
			$.getJSON(requestUrl, function(json){
				if(json.status != 4)  system.form.output("UserEdit", "error", "Konnte Benutzer nicht laden.");
				
				$('#formUserEditInputName').val(json.data[0]['name']);
				$('#formUserEditInputMail').val(json.data[0]['email']);
				$('#formUserEditInputGroup').val(json.data[0]['level']);
			});
		},
	
		/**
		 * @name userAdd
		 * @desc Add a new user to the database based on the values in the popup that triggered this
		 * @param {string} username - The user's name
		 * @param {string} usermail - The user's E-Mail address
		 * @param {string} userpass - The user's unencrypted password
		 * @param {string} usergroup - The user's group
		 */
		add: function(username, usermail, userpass, usergroup){
			if(!empty(username) && !empty(usermail) && !empty(userpass)){
			
				hashpass = $().crypt({method: "md5", source: userpass});
			
				requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/1/insert/`name`="'+username+'", `password`="'+hashpass+'", `email`="'+usermail+'", `level`="'+usergroup+'"';
					
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
		},
		
		/**
		 * @name userEdit
		 * @desc Edit a user in the database based on the values in the popup that triggered this
		 * @param {string} username - The user's name
		 * @param {string} usermail - The user's E-Mail address
		 * @param {string} userpass - The user's unencrypted password
		 * @param {string} usergroup - The user's group
		 */
		edit: function(username, usermail, userpass, usergroup){
			if(!empty(username) && !empty(usermail)){
			
				requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/id='+system.data+'/update/`name`="'+username+'", `email`="'+usermail+'", `level`="'+usergroup+'"';
				
				if(!empty(userpass)){
					hashpass = $().crypt({method: "md5", source: userpass});
					requestUrl += ', `password`="'+hashpass+'"';
				}
				
				$.getJSON(requestUrl, function(json){
					if(json.status == 4) system.form.output("UserEdit", "success", "Benutzerinformationen erfolgreich bearbeitet.");
					else system.form.output("UserEdit", "error", "Konnte Benutzer nicht bearbeiten.");
				});
			
			} else {
				system.form.output("UserEdit", "error", "Bitte wählen Sie Name, E-Mail und Gruppe aus.");
			}
		},
		
		/**
		 * @name userDodelete
		 * @desc Delete a user from the database
		 * @param {int} userid - The id of the respective user
		 */
		dodelete: function(userid){
			requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/id='+userid+'/update/`deleted`="1"';
			$.getJSON(requestUrl, function(json){
				if(json.status == 4) system.page.reload();
				else system.form.output("userdelete", "error", "Bei der Löschung des Benutzers ist ein Fehler aufgetreten.");
			});
		}
	}
}