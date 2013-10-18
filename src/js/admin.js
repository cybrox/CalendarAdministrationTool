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
					
					schedulestring  = '<div class="listp"><span>'+thiz['name']+'</span><div class="options">';
					schedulestring += '<a class="button tooltip" href="popup_subjectedit_'+thiz['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a>';
					schedulestring += '<a class="button tooltip" href="popup_semesterdelete_'+thiz['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a></div><div class="break"></div></div>';
				
					$('#subjectContent').append(schedulestring);
				}
				
				createLinkListener();
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
	
}