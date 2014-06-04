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
	admin.subject.loadAll();
	
	system.page.append();
	$('#viewUserName').text(system.user.me.view);

}

/**
 * Switch to another user
 */
function action_adminchoose(){
	selected = $('#formAdminChooseUser').val().split("::");
	system.user.me.id   = selected[0];
	system.user.me.view = selected[1];
	$('#viewUserName').text(selected[1]);
}

/**
 * @namespace Admin
 * @name Admin
 * @desc Administrative methods
 */
var admin = {
	
	subject: {
		/**
		 * @name subjectLoadAll
		 * @desc Request all subjects and generate a list on the admin page
		 */
		loadAll: function(){

			requestUrl = './src/api/database/'+system.user.me.auth+'/read/subject/deleted = 0';
					
			$.getJSON(requestUrl, function(json){
				if(json.error == ""){
				
					subjectcount = json.data.length;
					while(subjectcount--){
					
						val = json.data[subjectcount];
						
						subjectstring  = '<div class="listp"><i class="icon-tag"></i> <span>'+val['name']+'</span><div class="options">';
						subjectstring += '<a class="button tooltip" href="popup_subjectedit_'+val['id']+'"><i class="icon-wrench"></i> <span class="help">Bearbeiten</span></a>';
						subjectstring += '<a class="button tooltip" href="popup_subjectdelete_'+val['id']+'"><i class="icon-remove"></i> <span class="help">Löschen</span></a></div><div class="break"></div></div>';
					
						$('#subjectContent').append(subjectstring);
					}
					
					system.addListener.ajaxLink();
					
				} else {
					$('#subjectContent').html("Keine Kategorien gefunden.");
				}
			});
		},
	
		/**
		 * @name subjectLoadOne
		 * @desc Load a single subject's data to the edit form
		 * @param {int} subjectid - The respective subject's id
		 */
		loadOne: function(subjectid){
			requestUrl = './src/api/database/'+system.user.me.auth+'/read/subject/id='+subjectid;
			$.getJSON(requestUrl, function(json){
				if(json.status != 4)  system.form.output("SubjectEdit", "error", "Konnte Kalenderkategorie nicht laden.");
				
				$('#formSubjectEditInputName').val(json.data[0]['name']);
			});
		},
	
		/**
		 * @name subjectAdd
		 * @desc Add a new subject
		 * @param {string} subjectname - Name of the new subject
		 */
		add: function(subjectname){
			if(!empty(subjectname)){
			
				requestUrl = './src/api/database/'+system.user.me.auth+'/write/subject/1/insert/`name`="'+subjectname+'", `deleted`="0"';
					
				$.getJSON(requestUrl, function(json){
					if(json.status == 4){
						system.page.reload();
					} else {
						$('#errorUserAdd').text("Konnte Kategorie nicht hinzufügen.");
					}
				});
			
			} else {
				system.form.output("SubjectAdd", "error", "Sie müssen einen Namen für diese Kalenderkategorie definieren.");
			}
		},
		
		/**
		 * @name subjectEdit
		 * @desc Edit a subject in the database based on the values in the popup that triggered this
		 * @param {string} subjectname - The subjectname's name
		 */
		edit: function(subjectname){
			if(!empty(subjectname)){
			
				requestUrl = './src/api/database/'+system.user.me.auth+'/write/subject/id='+system.data+'/update/`name`="'+subjectname+'"';
				
				$.getJSON(requestUrl, function(json){
					if(json.status == 4) system.page.reload();
					else system.form.output("UserEdit", "error", "Konnte Benutzer nicht bearbeiten.");
				});
			
			} else {
				system.form.output("SubjectEdit", "error", "Sie müssen einen Namen für diese Kalenderkategorie definieren.");
			}
		},
		
		/**
		 * @name subjectDodelete
		 * @desc Delete a subject from the database
		 * @param {int} subjectid - The id of the respective subject
		 */
		dodelete: function(subjectid){
			requestUrl = './src/api/database/'+system.user.me.auth+'/write/subject/id='+subjectid+'/update/`deleted`="1"';
			$.getJSON(requestUrl, function(json){
				if(json.status == 4) system.page.reload();
				else system.form.output("SubjectDelete", "error", "Bei der Löschung der Kalenderkategorie ist ein Fehler aufgetreten.");
			});
		}
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
						
						$("#formAdminChooseUser").append("<option value=\""+val.id+"::"+val.name+"\">"+val.name+"</option>");
						
						htmlString  = '<div class="listp"><i class="icon-user"></i> <span>'+val['name']+'</span><div class="options">';
						htmlString += '<a class="button tooltip" href="popup_useredit_'+val['id']+'"><i class="icon-wrench"></i> <span class="help">Bearbeiten</span></a>';
						htmlString += '<a class="button tooltip" href="popup_userdelete_'+val['id']+'"><i class="icon-remove"></i> <span class="help">Löschen</span></a></div><div class="break"></div></div>';
					
						$('#userContent').append(htmlString);
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