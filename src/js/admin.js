/* CAT - Calendar Administration Tool
** Administrative funktionen
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/


/**
 * Seiteninitialisierung der Administrationsseite
 */
function pageinit_admin(){

	getAllUser();
	getAllSubjects();
	
	
	appendPage();

}


/**
 * Alle Kalenderkategorien laden
 *
 * Diese Funktion lädt alle Kalender-
 * kategorien für das Admininterface
 */
function getAllSubjects(){
	
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.admauth+'/read/subject/1=1',
		dataType: 'json',
		success: function(json){
			if(json.error !== ""){
				$('#subjectContent').html("Keine Kategorien gefunden.");
			} else {
				subjectcount = json.data.length;
				
				while(subjectcount--){
				
					thiz = json.data[subjectcount];
					
					subjectstring  = '<div class="listp"><i class="icon-tag"></i> <span>'+thiz['name']+'</span><div class="options">';
					subjectstring += '<a class="button tooltip" href="popup_subjectedit_'+thiz['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a>';
					subjectstring += '<a class="button tooltip" href="popup_subjectdelete_'+thiz['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a></div><div class="break"></div></div>';
				
					$('#subjectContent').append(subjectstring);
				}
				
				createLinkListener();
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
	
}


/**
 * Alle Benutzer auslesen
 */
function getAllUser(){
	
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.admauth+'/read/user/1=1',
		dataType: 'json',
		success: function(json){
			if(json.error !== ""){
				$('#userContent').html("Keine Benutzer gefunden.");
			} else {
				usercount = json.data.length;
				
				while(usercount--){
				
					thiz = json.data[usercount];
					
					userstring  = '<div class="listp"><i class="icon-user"></i> <span>'+thiz['name']+'</span><div class="options">';
					userstring += '<a class="button tooltip" href="popup_useredit_'+thiz['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a>';
					userstring += '<a class="button tooltip" href="popup_userdelete_'+thiz['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a></div><div class="break"></div></div>';
				
					$('#userContent').append(userstring);
				}
				
				createLinkListener();
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
}