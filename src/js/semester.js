/* CAT - Calendar Administration Tool
** Semester handling and mark evaluation
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/


/**
 * @namespace Semester
 * @name Semester
 * @desc Semester and mark evaluation methods
 */
var semester = {
	
	/**
	 * @name semesterLoadAll
	 * @desc Load all semesters from the database and generate a list
	 * @param {boolean} editable - Will display the buttons to edit or delete a semester if set to true
	 */
	loadAll: function(editable){
		
		requestUrl = "./src/api/database/"+system.user.me.auth+"/read/semester/`deleted`='0' AND `userid`='"+system.user.me.id+"'";
		
		$.getJSON(requestUrl, function(json){
			if(json.error == ""){
			
				$('#semesterContainer').empty();
				semestercount = json.data.length;
				while(semestercount--){
					val = json.data[semestercount];
					
					if(editable){
						optionsstring = '<a class="button tooltip" href="popup_semesteredit_'+val['id']+'"><i class="icon-wrench"></i> <span class="help">Bearbeiten</span></a> <a class="button tooltip" href="popup_semesterdelete_'+val['id']+'"><i class="icon-remove"></i> <span class="help">Löschen</span></a>';
					} else {
						datastring = val['name']+'::'+val['startdate']+'::'+val['enddate'];
						optionsstring = '<a class="button tooltip" href="popup_semesterrate_'+datastring+'"><i class="icon-play"></i> <span>Auswerten</span></a>';
					}
					
					$('#semesterContainer').append('<div class="smalldouble"><div class="doublepart"><i class="icon-ticket"></i> '+val['name']+'</div><div class="doublepart"><i class="icon-calendar"></i>'+chdate(val['startdate'])+' <span class="gray">bis</span> '+chdate(val['enddate'])+'<div class="options">'+optionsstring+'</div></div><div class="break"></div></div>');
				}
				
				system.addListener.ajaxLink();
				
			} else {
				$('#semesterContainer').html("Keine Semester gefunden.");
			}
		});
	},
	
	/**
	 * @name semesterRequest
	 * @desc Request a single semester from the database for the edit form
	 */
	loadOne: function(semesterid){
		requestUrl = "./src/api/database/"+system.user.me.auth+"/read/semester/`id`='"+semesterid+"'";
		$.getJSON(requestUrl, function(json){
			if(json.status != 4)  system.form.output("SemesterEdit", "error", "Konnte Semester nicht laden.");

			$('#formSemesterEditInputName').val(json.data[0]['name']);
			$('#formSemesterEditInputStart').val(json.data[0]['startdate']);
			$('#formSemesterEditInputEnd').val(json.data[0]['enddate']);
		});
	},
	
	/**
	 * @name semesterCreate
	 * @desc Create a new semester from the popup on the semesters page
	 * @param {string} semesterName - The name of the new semester
	 * @param {string} semesterDateStart - The start date of the new semester
	 * @param {string} semesterDateEnd - The end date of the new semester
	 */
	create: function(semesterName, semesterDateStart, semesterDateEnd){
	
		if(!semester.validate("SemesterAdd", semesterName, semesterDateStart, semesterDateEnd)) return;
		
		requestUrl = "./src/api/database/"+system.user.me.auth+"/write/semester/1/insert/";
		requestUrl += encodeURIComponent("`userid`='"+system.user.me.id+"', `name`='"+semesterName+"', ");
		requestUrl += encodeURIComponent("`startdate`='"+semesterDateStart+"', `enddate`='"+semesterDateEnd+"'");
		
		$.getJSON(requestUrl, function(json){
			if(json.status == 4) system.page.reload();
			else system.form.output("SemesterEdit", "error", "Beim speichern des Semesters ist ein Fehler aufgetreten.");
		});
	},

	/**
	 * @name semesterEdit
	 * @desc Save semester edit form to the database
	 * @param {string} semesterName - The name of the new semester
	 * @param {string} semesterDateStart - The start date of the new semester
	 * @param {string} semesterDateEnd - The end date of the new semester
	 */
	edit: function(semesterName, semesterDateStart, semesterDateEnd){
	
		if(!semester.validate("SemesterEdit", semesterName, semesterDateStart, semesterDateEnd)) return;
		
		requestUrl = "./src/api/database/"+system.user.me.auth+"/write/semester/id='"+system.data+"'/update/";
		requestUrl += encodeURIComponent("`name`='"+semesterName+"', `startdate`='"+semesterDateStart+"', ");
		requestUrl += encodeURIComponent("`enddate`='"+semesterDateEnd+"'");
		
		$.getJSON(requestUrl, function(json){
			if(json.status == 4) system.page.reload();
			else system.form.output("SemesterEdit", "error", "Beim speichern des Semesters ist ein Fehler aufgetreten.");
		});
	},
	
	/**
	 * @name semesterValidate
	 * @desc Check if all values are valid to generate a semester
	 * @param {string} errorOutput - Name of the error output field
	 * @param {string} semestername - The semesters name
	 * @param {string} semesterstart - The start date in YYYY-MM-DD format
	 * @param {string} semesterend - The end date in YYYY-MM-DD format
	 * @return {boolean} Will return true if the given parameters were vaild
	 */
	validate: function(errorOutput, semestername, semesterstart, semesterend){
		if(empty(semestername)){
			system.form.output(errorOutput, "error", "Der Semestername muss mindestens ein Zeichen lang sein.");
			return false;
		}
		
		if(empty(semesterstart) || empty(semesterend)){
			system.form.output(errorOutput, "error", "Es müssen Start- und Enddatum eingegeben werden.");
			return false;
		}
		
		return true;
	},
	
	/**
	 * @name semesterDelete
	 * @desc Delete a semester from the database
	 */
	dodelete: function(semesterid){
	
		requestUrl = "./src/api/database/"+system.user.me.auth+"/write/semester/id='"+semesterid+"'/update/`deleted`='1'";
		
		$.getJSON(requestUrl, function(json){
			if(json.status == 4) system.page.reload();
			else $('#errorSemester').text("Beim speichern des Semesters ist ein Fehler aufgetreten.");	
		});
	}
}


/**
 * @name pageinitSemester
 * @desc Load all semester and display them in a list
 */
function pageinit_semester(){
	semester.loadAll(true);
	system.page.append();
}

/**
 * @name pageinitRating
 * @desc Load all semester and display them in a list
 */
function pageinit_rating(){
	semester.loadAll(false);
	system.page.append();
}