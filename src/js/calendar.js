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

//	if($.isEmptyObject(system.subj)) loadAllSubjects();
	calendar.scheduleRequestAll();
			
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
	 * @desc Load all upcomnig tasks and generate a list
	 */
	scheduleRequestAll: function(){

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
				
				schedulestring += '<div name="'+val['id']+'" class="tripple hoverable"><div class="tripplepart"><i class="icon-calendar"></i> ';
//					schedulestring += (val['scheduletype'] == 1) ? ' <span class="gray">Termin</span>': ' <span class="gray">Prüfung</span>';
				schedulestring += chdate(val['targetdate'])+' - <span class="gray">'+getSubjectById(val['subjectid']);
				schedulestring += ': </span></div><div class="tripplepart"> '+val['title'];
				schedulestring += '</div><div class="tripplepart"><p class="grey small"> '+val['description']+'</p>';
				schedulestring += '</div><div class="break"></div></div>';
			}
			
			$('#scheduleContainer').append(schedulestring);
			
		});

	}
}