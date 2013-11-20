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
 * @name pageinitSemester
 * @desc Load all semester and display them in a list
 */
function pageinit_semester(){
	semester.loadAll(true);
	system.page.append();
}

/**
 3 @name pageinitRating
 * @desc Load all semester and display them in a list
 */
function pageinit_rating(){
	semester.loadAll(false);
	system.page.append();
}


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
				$('#semesterContainer').html("Keine Semester gefunden.");
			}
		});
	},
	
	/**
	 * @name semesterRequest
	 * @desc Request a single semester from the database for the edit form
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
	 * @name semesterCreate
	 * @desc Create a new semester from the popup on the semesters page
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
	 * @name semesterEdit
	 * @desc Save semester edit form to the database
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
	 * @name semesterValidate
	 * @desc Check if all values are valid to generate a semester
	 * @param {string} semestername - The semesters name
	 * @param {string} semesterstart - The start date in YYYY-MM-DD format
	 * @param {string} semesterend - The end date in YYYY-MM-DD format
	 * @return {boolean} Will return true if the given parameters were vaild
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
	 * @name semesterDelete
	 * @desc Delete a semester from the database
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