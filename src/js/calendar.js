/* CAT - Calendar Administration Tool
** Cascading Style Sheet, Hauptstyle
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
}