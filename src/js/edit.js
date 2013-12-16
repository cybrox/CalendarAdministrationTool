/* CAT - Calendar Administration Tool
** User profile handling
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/


/**
 * @name pageinitEdit
 * @desc Load user details and prefill the profile form
 */
function pageinit_edit(){
	
	var userType = (system.user.me.level == 2) ? "Administrator" : "Normaler Benutzer";
	var userHelp = (system.user.me.help !== "0") ? true : false;
	
	$('#editDataUserId').text("#"+system.user.me.id);
	$('#editDataUsername').text(system.user.me.name);
	$('#editDataUsertype').text(userType);
	
	$('#editDataUsermail').val(system.user.me.email);
	$("#editDataUserhelp").attr("checked", userHelp);
	
	system.addListener.enterSubmit();
	system.page.append();
}


/**
 * @namespace Edit
 * @name Edit
 * @desc Profile administration methods
 */
var edit = {
	
	/**
	 * @name editSubmit
	 * @desc Submit the profile form and save the informations in the database
	 * @param {string} usermail - The user's E-Mail adress
	 * @param {string} userpass - The user's new password
	 * @param {string} userpas2 - Same as "userpass"
	 * @param {string} userhelp - Display help messages settings
	 */
	submit: function(usermail, userpass, userpas2, userhelp){
		uservalid = true;
		userhelp  = (userhelp == true) ? "1" : "0";
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/write/user/id='+system.user.me.id+'/update/`email` = "'+usermail+'", `help` = "'+userhelp+'"';
		
		if(userpass !== ""){
			if(userpass !== userpas2){
				system.form.output("edit", "error", "Die eingegebenen Passwörter stimmen nicht überein.");
				
				uservalid = false;
			}
			
			hashpass = $().crypt({method: "md5", source: userpass});
			requestUrl += ', `password` = "'+hashpass+'"';
		}
		
		if(uservalid){
			$.getJSON(requestUrl, function(json){
				system.form.output("edit", "success", "Änderungen erfolgreich gespeichert.");
				system.user.request(false);
			});
		}

	}
}