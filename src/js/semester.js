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
		url: './src/api/database/'+user.auth+'/read/semester/deleted="0" AND userid='+user.id,
		dataType: 'json',
		success: function(json){
			$('#semsterContainer').html("");
			
			if(json.error !== ""){
				$('#semsterContainer').html("Es wurden keine Semester für den Benutzer "+user.name+" gefunden.");
			} else {
				semestercount = json.data.length;
				
				while(semestercount--){
					$('#semsterContainer').append('<div class="smalldouble"><div class="doublepart"><i class="icon-ticket"></i> '+json.data[semestercount]['name']+'</div><div class="doublepart"><i class="icon-calendar"></i>'+chdate(json.data[semestercount]['startdate'])+' <span class="gray">bis</span> '+chdate(json.data[semestercount]['enddate'])+'<div class="options"><a class="button tooltip" href="popup_semesteredit_'+json.data[semestercount]['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a> <a class="button tooltip" href="popup_semesterdelete_'+json.data[semestercount]['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a></div></div><div class="break"></div></div>');
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
	
	if(!validateSemester(semestername, semesterstart, semesterend)) return false;
	
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


/**
 * Semesterdetails auslesen
 *
 * Diese Funktion liest die Semesterdetails aus
 * der Datenbank und schreibt die Werte in das
 * Popup zum baerbeiten eines Semesters
 */
function getSemesterDetails(semesterid){
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/read/semester/id='+semesterid,
		dataType: 'json',
		success: function(json){
		
			$('#inpSemTitle').val(json.data[0]['name']);
			$('#inpSemStart').val(json.data[0]['startdate']);
			$('#inpSemEnd').val(json.data[0]['enddate']);
			
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
}


/**
 * Semester bearbeiten
 *
 * speichert die neuen informationen nach dem
 * bearbeiten in der Datenbank.
 */
function editSemester(semesterid){

	semestername  = $('#inpSemTitle').val();
	semesterstart = $('#inpSemStart').val();
	semesterend   = $('#inpSemEnd').val();
	
	if(!validateSemester(semestername, semesterstart, semesterend)) return false;
	
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/write/semester/id='+semesterid+'/update/`name`="'+semestername+'", `startdate`="'+semesterstart+'", `enddate`="'+semesterend+'"',
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


/**
 * Semestereingaben prüfen
 */
function validateSemester(semestername, semesterstart, semesterend){
	
	if(empty(semestername)){
		$('#errorSemester').text("Der Semestername muss mindestens ein Zeichen lang sein.");
		return false;
	}
	
	if(empty(semesterstart) || empty(semesterend)){
		$('#errorSemester').text("Es müssen Start- und Enddatum eingegeben werden.");
		return false;
	}
	
	return true;
}


/**
 * Semester löschen
 *
 * Diese Funktion erlaubt es nach bestätigen der
 * Sicherheitsabfrage ein Semester zu löschen.
 */
function deleteSemester(semesterid){
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/write/semester/id='+semesterid+'/update/`deleted`="1"',
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