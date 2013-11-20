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

	admin.getAllUser();
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
	 * @name userRequestAll
	 * @desc Request all users and generate a list on the admin page
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
	
	/**
	 * @name userAdd
	 * @desc Add a new user to the database based on the values in the popup that triggered this
	 */
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