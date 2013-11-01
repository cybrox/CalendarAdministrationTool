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
	semester.loadAll(true);
	system.page.append();
}


/**
 * Seiteninitialisierung der Auswertung
 *
 * Lädt alle verfügbaren Semester um dem
 * Benutzer eine Auswahl zu ermöglichen von
 * welchem Semester er die Noten anzeigen
 * will.
 */
function pageinit_rating(){
	semester.loadAll(false);
	system.page.append();
}


var semester = {
	/**
	 * Laden aller Semester eines Benutzers
	 *
	 * Diese Funktion lädt alle Semester eines
	 * Benutzers und erstellt eine passende Liste
	 */
	loadAll: function(editable){
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/read/semester/deleted="0" AND userid='+system.user.me.id;
		
		$.getJSON(requestUrl, function(json){
			if(json.error == ""){
			
				semestercount = json.data.length;
				while(semestercount--){
					
					if(editable){
						optionsstring = '<a class="button tooltip" href="popup_semesteredit_'+json.data[semestercount]['id']+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a> <a class="button tooltip" href="popup_semesterdelete_'+json.data[semestercount]['id']+'"><i class="icon-remove"></i> <span>Löschen</span></a>';
					} else {
						optionsstring = '<a class="button tooltip" href="action_ratesemester_'+json.data[semestercount]['id']+'"><i class="icon-play"></i> <span>Auswerten</span></a>';
					}
					
					$('#semesterContainer').append('<div class="smalldouble"><div class="doublepart"><i class="icon-ticket"></i> '+json.data[semestercount]['name']+'</div><div class="doublepart"><i class="icon-calendar"></i>'+chdate(json.data[semestercount]['startdate'])+' <span class="gray">bis</span> '+chdate(json.data[semestercount]['enddate'])+'<div class="options">'+optionsstring+'</div></div><div class="break"></div></div>');
				}
				
				system.addListener.ajaxLink();
				
			} else {
				$('#semesterContainer').html("Es wurden keine Semester für den Benutzer "+user.name+" gefunden.");
			}
		});
	},
	
	
	/**
	 * Semesterdetails auslesen
	 *
	 * Diese Funktion liest die Semesterdetails aus
	 * der Datenbank und schreibt die Werte in das
	 * Popup zum baerbeiten eines Semesters
	 */
	loadOne: function(semesterid){
	
		requestUrl = './src/api/database/'+system.user.me.auth+'/read/semester/id='+semesterid;
			
		$.getJSON(requestUrl, function(json){
				$('#inpSemTitle').val(json.data[0]['name']);
				$('#inpSemStart').val(json.data[0]['startdate']);
				$('#inpSemEnd').val(json.data[0]['enddate']);
				
		});
	},
	
	
	/**
	 * Erstellen eines neuen Semesters
	 *
	 * Diese Funktion liest die eingegebenen Daten aus
	 * dem Popup Formular und erstellt ein neues Semester.
	 */
	create: function(){

		semestername  = $('#inpSemTitle').val();
		semesterstart = $('#inpSemStart').val();
		semesterend   = $('#inpSemEnd').val();
		
		if(!semester.validate(semestername, semesterstart, semesterend)) return false;
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/write/semester/1/insert/`userid`="'+system.user.me.id+'", `name`="'+semestername+'", `startdate`="'+semesterstart+'", `enddate`="'+semesterend+'"';
		
		$.getJSON(requestUrl, function(json){
		
			if(json.status == 4){
			
				system.popup("close");
				system.page.reload();
				
			} else {
				$('#errorSemester').text("Beim speichern des Semesters ist ein Fehler aufgetreten.");
			}
		});
	},

	
	/**
	 * Semester bearbeiten
	 *
	 * speichert die neuen informationen nach dem
	 * bearbeiten in der Datenbank.
	 */
	edit: function(){

		semestername  = $('#inpSemTitle').val();
		semesterstart = $('#inpSemStart').val();
		semesterend   = $('#inpSemEnd').val();
		
		if(!semester.validate(semestername, semesterstart, semesterend)) return false;
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/write/semester/id='+system.data+'/update/`name`="'+semestername+'", `startdate`="'+semesterstart+'", `enddate`="'+semesterend+'"';
		
		$.getJSON(requestUrl, function(json){
		
				if(json.status == 4){
				
					system.popup("close");
					system.page.reload();
					
				} else {
					$('#errorSemester').text("Beim speichern des Semesters ist ein Fehler aufgetreten.");
				}
				
		});
	},
	
	/**
	 * Semestereingaben prüfen
	 */
	validate: function(semestername, semesterstart, semesterend){
		
		if(empty(semestername)){
			$('#errorSemester').text("Der Semestername muss mindestens ein Zeichen lang sein.");
			return false;
		}
		
		if(empty(semesterstart) || empty(semesterend)){
			$('#errorSemester').text("Es müssen Start- und Enddatum eingegeben werden.");
			return false;
		}
		
		return true;
	},
	
	/**
	 * Semester löschen
	 *
	 * Diese Funktion erlaubt es nach bestätigen der
	 * Sicherheitsabfrage ein Semester zu löschen.
	 */
	dodelete: function(semesterid){
	
		
		requestUrl = './src/api/database/'+system.user.me.auth+'/write/semester/id='+semesterid+'/update/`deleted`="1"';
		
		$.getJSON(requestUrl, function(json){
		
			if(json.status == 4){
			
				system.popup("close");
				system.page.reload();
				
			} else {
				$('#errorSemester').text("Beim speichern des Semesters ist ein Fehler aufgetreten.");
			}
				
		});
	}
}