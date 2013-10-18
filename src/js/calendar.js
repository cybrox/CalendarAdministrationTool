/* CAT - Calendar Administration Tool
** Kalender und Terminlisten Funktionen
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/

function pageinit_calendar(){
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
	$.ajax({
		type: 'GET',
		url: './src/api/database/'+user.auth+'/read/schedule/deleted="0" AND userid='+user.id+'/ORDER BY `id` DESC LIMIT 0, 20',
		dataType: 'json',
		success: function(json){
				console.log(json);
			if(json.error !== ""){
				$('#scheduleContainer').html("Es wurden keine anstehenden Termine gefunden.");
			} else {
			
				
				createLinkListener();
			}
		},
		error: function() {
			$.error("Konnte keine Verbindung zur Datenbankschnittstelle herstellen.");
		}
	});
			
	appendPage();
}