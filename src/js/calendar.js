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
	calendar.ui.initialize();
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
	
	ui: {
		eventcache: new Array,
		datescache: "",
		
		initialize: function(){
			$("#calendarBody").datepicker({
				prevText: "<i class=\"icon-angle-left\"></i>",
				nextText: "<i class=\"icon-angle-right\"></i>",
				inline: true,
				firstDay: 1,
				showOtherMonths: true,
				
//				onSelect:          calendar.ui.handleInput,
				onChangeMonthYear: calendar.ui.handleSwipe,
				
				dayNamesMin:   ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
				dayNamesShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
				dayNames:      ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
				
				monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
				monthNames:      ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ]
			});
			
			var currentDate = $.datepicker.formatDate("yy-mm", $("#calendarBody").datepicker("getDate"));
			var currnewDate = currentDate.split("-");
			calendar.ui.fetchData(currnewDate[0], currnewDate[1]);
			
			system.page.append();
		},
	
		handleInput: function(){
			alert($(this).datepicker('getDate'));
			calendar.ui.appendData();
		},
		
		handleSwipe: function(year, month, element){
			console.log("swiped month");
			calendar.ui.fetchData(year, month);
		},
		
		fetchData: function(year, month){
			calendar.ui.datescache = year+"-"+month+"-";
			var startDate = year+"-"+month+"-01";
			
			requestUrl  = "./src/api/database/"+system.user.me.auth+"/read/schedule/";
			requestUrl += "`userid` = '"+system.user.me.id+"' AND `deleted` = '0' AND `targetdate` BETWEEN '"+startDate+"' AND LAST_DAY('"+startDate+"') ORDER BY `targetdate` DESC";
			
			$.getJSON(requestUrl, function(json){
				calendar.ui.eventcache = json.data;
				
				var monthStarted = false;
				if(empty(calendar.ui.eventcache)) return;
				
				$("#calendarBody").datepicker("refresh");
				$("td").each(function(){
					var dayField  = $(this);
					var dayNumber = $(this).children().first().text();
					
					if(dayNumber == "1") monthStarted = ~monthStarted;
					
					if(monthStarted){
						if(parseInt(dayNumber) < 10) dayNumber = "0"+dayNumber;
						dayField
							.attr("id", "f"+year+"-"+month+"-"+dayNumber)
							.unbind()
							.click(function(){
								var thisDay   = $(this).children().first().text();
								var dayNumber = (parseInt(dayNumber) < 10) ? "0"+thisDay : thisDay;
								
								system.addListener.handleLink("popup_scheduleview_"+calendar.ui.datescache+dayNumber);
							});
					}
				});
				calendar.ui.appendData();
			});
		},
		
		appendData: function(){
			$.each(calendar.ui.eventcache, function(key, value){
				calendar.ui.appendSchedule($("#f"+value.targetdate), value);
			});
		},
		
		appendSchedule: function(field, schedule){
			field.append("<span class=\"schedule scheduletype"+schedule.scheduletype+"\">"+schedule.title+"</span>");
		}
	},
	
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
				
				schedulestring += '<div name="'+val['id']+'" class="tripple"><div class="tripplepart"><span class="';
				schedulestring += (val['scheduletype'] == "2") ? "error" : "success";
				schedulestring += '"><i class="icon-calendar"></i> </span> ';
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
	
	loadOneDay: function(scheduledate){
	
		requestUrl = './src/api/database/'+system.user.me.auth+'/read/schedule/targetdate='+scheduledate;
		$.getJSON(requestUrl, function(json){
			console.log(json);
		});
	},
	
	loadOne: function(scheduleid){
	
		requestUrl = './src/api/database/'+system.user.me.auth+'/read/schedule/id='+scheduleid;
		$.getJSON(requestUrl, function(json){
			if(json.status != 4){
				system.form.output("ScheduleEdit", "error", "Konnte Termin nicht laden.");
				return;
			}
			
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