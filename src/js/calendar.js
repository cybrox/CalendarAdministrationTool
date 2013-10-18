/* CAT - Calendar Administration Tool
** Kalender und Terminlisten Funktionen
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/

function pageinit_calendar(){

	if($.isEmptyObject(system.subj)) loadAllSubjects();
	
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
			
	appendPage();
}

/**
 * Seiteninitialisierung der Terminübersicht
 *
 * Lädt anstehende Termine und generiert eine Liste
 */
function pageinit_list(){

	if($.isEmptyObject(system.subj)) loadAllSubjects();

	loadAllUpcoming(false);
			
	appendPage();
}


/**
 * Lade alle termine
 */
function loadAllUpcoming(todayonly){

	outputType  = (todayonly) ? "double" : "smalldouble";
	requestUrl  = './src/api/database/'+user.auth+'/read/schedule/';
	requestUrl += '`userid` = \''+user.id+'\' AND `targetdate` ';
	if(!todayonly) requestUrl += '>';
	requestUrl += '= \''+now()+'\' AND `deleted` = \'0\'/ORDER BY `targetdate` DESC';

	
	$.ajax({
		type: 'GET',
		url: requestUrl,
		dataType: 'json',
		success: function(json){
			if(json.error !== ""){
				$('#scheduleContainer').html("Keine anstehenden Termine gefunden.");
			} else {
				schedulecount = json.data.length;
				
				while(schedulecount--){
				
					sd = json.data[schedulecount];
				
					schedulestring  = '<div class="'+outputType+' bbtm"><div class="doublepart"><i class="icon-calendar"></i> '+chdate(sd['targetdate']);
					schedulestring += (sd['scheduletype'] == 1) ? ' <span class="gray">Termin</span>': ' <span class="gray">Prüfung</span>';
					schedulestring += '<br /><i class="tooltip icon-bell"></i>'+sd['title'];
					schedulestring += '<span class="gray"> '+getSubjectById(sd['subjectid'])+'</span>';
					schedulestring += '</div><div class="doublepart"><p class="grey small"> '+sd['description']+'</p>';
					schedulestring += '</div><div class="break"></div></div>';
				
					$('#scheduleContainer').append(schedulestring);
				}
				
				if(todayonly) $('#calendarUpcomingNum').text(json.data.length);
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});

}