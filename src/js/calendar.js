/* CAT - Calendar Administration Tool
** Calendar and schedule methods
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/


/**
 * @name pageinitCalendar
 * @desc Load the calendae and todays upcoming tasks
 */
function pageinit_calendar(){

//	if($.isEmptyObject(system.subj)) loadAllSubjects();
	$('#calendarBody').datepicker({
		prevText: "<i class=\"icon-caret-left\"></i>",
		nextText: "<i class=\"icon-caret-right\"></i>",
        inline: true,
        firstDay: 1,
        showOtherMonths: true,
        dayNames: [
			'Sonntag',
			'Montag',
			'Dienstag',
			'Mittwoch',
			'Donnerstag', 
			'Freitag',
			'Samstag'
		],
        dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
		monthNames: [
			'Januar',
			'Februar',
			'März',
			'April',
			'Mai',
			'Juni',
			'Juli',
			'August',
			'September',
			'Oktober',
			'November',
			'Dezember'
		],
		monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    });
	
	$.each($('td'), function(){
		$(this).append("<p class=\"schedule\"></p><p class=\"schedule\"></p>");
	});
			
	system.page.append();
}

/**
 * @name pageinitList
 * @desc Load all upcoming tasks and generate a list
 */
function pageinit_list(){
	calendar.listAll();
	system.page.append();
}


/**
 * @namespace Calendar
 * @name Calendar
 * @desc Calendar and schedule management
 */
var calendar = {

	/**
	 * @name scheduleRequestAll
	 * @desc Load all upcoming tasks and generate a list
	 */
	listAll: function(){

		requestUrl  = './src/api/database/'+system.user.me.auth+'/read/schedule/';
		requestUrl += '`userid` = \''+system.user.me.id+'\' AND `deleted` = \'0\' AND `targetdate` >= CURDATE() ORDER BY `targetdate` DESC';

		
		$.getJSON(requestUrl, function(json){
		
			if(json.error != ""){
				$('#scheduleContainer').html("Keine anstehenden Termine gefunden.");
				return;
			}
				
			schedulenotnow = false;
			schedulestring = '<h3><i class="icon-bell"></i> Heute anstehende Termine</h3>';
			schedulecount  = json.data.length;
			schedulecounto = schedulecount - 1;
			while(schedulecount--){
				val = json.data[schedulecount]; 
				
				if(after(val['targetdate']) && !schedulenotnow){ // Date Check here
					schedulenotnow  = true;
					if(schedulecount == schedulecounto) schedulestring += "Keine heute anstehenden Termine gefunden.";
					schedulestring += '<div class="hline"></div><h3><i class="icon-bell"></i> Weitere anstehende Termine</h3>';
				}
				
				schedulestring += '<div name="'+val['id']+'" class="tripple"><div class="tripplepart"><i class="icon-calendar"></i> ';
				schedulestring += chdate(val['targetdate'])+' - <span class="gray">'+getSubjectById(val['subjectid']);
				schedulestring += ': </span></div><div class="tripplepart"> '+val['title'];
				schedulestring += '</div><div class="tripplepart"><span class="small">'+val['description']+'</span><div class="options">';
				schedulestring += '<a class="button tooltip" href="popup_scheduleedit_'+val['id']+'"><i class="icon-wrench"></i> <span class="help">Bearbeiten</span></a>';
				schedulestring += '<a class="button tooltip" href="popup_scheduledelete_'+val['id']+'"><i class="icon-remove"></i> <span class="help">Löschen</span></a>';
				schedulestring += '</div></div><div class="break"></div></div>';
			}
			
			$('#scheduleContainer').append(schedulestring);
			system.addListener.ajaxLink();
		});
	},
	
	loadOne: function(scheduleid){
	
		requestUrl = './src/api/database/'+system.user.me.auth+'/read/schedule/id='+scheduleid;
		$.getJSON(requestUrl, function(json){
			if(json.status != 4)  system.form.output("ScheduleEdit", "error", "Konnte Termin nicht laden.");
			$('#formScheduleEditInputType').val(json.data[0]['scheduletype']);
			$('#formScheduleEditInputCategory').val(json.data[0]['subjectid']);
			$('#formSemesterEditInputTitle').val(json.data[0]['title']);
			$('#formSemesterEditInputDesc').text(json.data[0]['description']);
			$('#formSemesterEditInputDate').val(json.data[0]['targetdate']);
		});
	},
		
	/**
	 * @name scheduleDodelete
	 * @desc Delete an event from the database
	 * @param {int} scheduleid - The id of the respective event
	 */
	dodelete: function(scheduleid){
		requestUrl = './src/api/database/'+system.user.me.auth+'/write/schedule/id='+scheduleid+'/update/`deleted`="1"';
		$.getJSON(requestUrl, function(json){
			if(json.status == 4) system.page.reload();
			else system.form.output("userdelete", "error", "Bei der Löschung des Termins ist ein Fehler aufgetreten.");
		});
	}
}