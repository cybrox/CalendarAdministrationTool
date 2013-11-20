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
	loadAllUpcoming(true);
	
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
	loadAllUpcoming(false);
			
	system.page.append();
}


/**
 * @name scheduleRequestAll
 * @desc Load all upcomnig tasks and generate a list
 * @param {boolean} todayonly - Will only load tasks from today if set to true
 */
function loadAllUpcoming(todayonly){

	outputType  = (todayonly) ? "double" : "smalldouble";
	requestUrl  = './src/api/database/'+system.user.me.auth+'/read/schedule/';
	requestUrl += '`userid` = \''+system.user.me.id+'\' AND `targetdate` ';
	if(!todayonly) requestUrl += '>';
	requestUrl += '= \''+now()+'\' AND `deleted` = \'0\'/ORDER BY `targetdate` DESC';

	
	$.getJSON(requestUrl, function(json){
	
		if(json.error == ""){
			
			schedulecount = json.data.length;
			while(schedulecount--){
			
				val = json.data[schedulecount];
			
				schedulestring  = '<div class="'+outputType+' bbtm"><div class="doublepart"><i class="icon-calendar"></i> '+chdate(val['targetdate']);
				schedulestring += (val['scheduletype'] == 1) ? ' <span class="gray">Termin</span>': ' <span class="gray">Prüfung</span>';
				schedulestring += '<br /><i class="tooltip icon-bell"></i>'+val['title'];
				schedulestring += '<span class="gray"> '+getSubjectById(val['subjectid'])+'</span>';
				schedulestring += '</div><div class="doublepart"><p class="grey small"> '+val['description']+'</p>';
				schedulestring += '</div><div class="break"></div></div>';
			
				$('#scheduleContainer').append(schedulestring);
			}
			
			if(todayonly) $('#calendarUpcomingNum').text(json.data.length);
		
		} else {
			$('#scheduleContainer').html("Keine anstehenden Termine gefunden.");
			$('#calendarUpcomingNum').text("0");
		}
		
	});

}