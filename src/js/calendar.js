/* CAT - Calendar Administration Tool
** Kalender und Terminlisten Funktionen
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
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
 * Seiteninitialisierung der Terminübersicht
 *
 * Lädt anstehende Termine und generiert eine Liste
 */
function pageinit_list(){

//	if($.isEmptyObject(system.subj)) loadAllSubjects();
	loadAllUpcoming(false);
			
	system.page.append();
}


/**
 * Lade alle termine
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