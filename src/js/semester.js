/* CAT - Calendar Administration Tool
** Semesterverwalung und Notenauswertung
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/


/**
 * Seiteninitalisierung der Semesterübersicht
 *
 * Lädt alle vom Benutzer eingetragenen
 * Semester und erstellt eine einfache
 * bearbeitbare Liste.
 */
function pageinit_semester(){
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/read/semester/userid='+user.id,
		dataType: 'json',
		success: function(json){
			$('#semsterContainer').html("");
			
			if(json.error !== ""){
				$('#semsterContainer').html("Es wurden keine Semester für den Benutzer "+user.name+" gefunden.");
			} else {
				console.log(json.data);
				semestercount = json.data.length;
				
				while(semestercount--){
					$('#semsterContainer').append('<div class="smalldouble"><div class="doublepart"><i class="icon-ticket"></i> '+json.data[semestercount]['name']+'</div><div class="doublepart"><i class="icon-calendar"></i>'+json.data[semestercount]['startdate']+' bis '+json.data[semestercount]['enddate']+'<div class="options"><a class="button tooltip" href="popup_editsemester"><i class="icon-wrench"></i> <span>Bearbeiten</span></a> <a class="button tooltip" href="action_deletesemester"><i class="icon-remove"></i> <span>Löschen</span></a></div></div><div class="break"></div></div>');
				}
				
				createLinkListener();
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
	
	appendPage();
}


/**
 * Erstellen eines neuen Semesters
 *
 * Diese Funktion liest die eingegebenen Daten aus
 * dem Popup Formular und erstellt ein neues Semester.
 */
function submitNewSemester(){

	semestername  = $('#inpSemTitle').val();
	semesterstart = $('#inpSemStart').val();
	semesterend   = $('#inpSemEnd').val();
	
	
	if(empty(semestername)){
		$('#errorSemester').text("Der Semestername muss mindestens ein Zeichen lang sein.");
		return false;
	}
	
	if(empty(semesterstart) || empty(semesterend)){
		$('#errorSemester').text("Es müssen Start- und Enddatum eingegeben werden.");
		return false;
	}
	
	
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/write/semester/1/insert/`userid`="'+user.id+'", `name`="'+semestername+'", `startdate`="'+semesterstart+'", `enddate`="'+semesterend+'"',
		dataType: 'json',
		success: function(json){
			if(json.status == 4){
				$.popup("close");
				reloadPage();
			} else {
				$('#errorSemester').text("Beim speichern des Semesters ist ein Fehler aufgetreten.");
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
	
}