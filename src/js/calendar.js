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
				onChangeMonthYear: calendar.ui.handleSwipe,
				showOtherMonths: true,
				inline: true
			});
			
			var currentDate = $.datepicker.formatDate("yy-mm", $("#calendarBody").datepicker("getDate"));
			var currnewDate = currentDate.split("-");
			calendar.ui.fetchData(currnewDate[0], currnewDate[1]);
			
			system.page.append();
		},
		
		handleSwipe: function(year, month, element){
			calendar.ui.fetchData(year, month);
		},
		
		fetchData: function(year, month){
			if(month.length != 2) month = "0"+month;
			calendar.ui.datescache = year+"-"+month+"-";
			var startDate = year+"-"+month+"-01";
			
			requestUrl  = "./src/api/database/"+system.user.me.auth+"/read/schedule/";
			requestUrl += "`userid` = '"+system.user.me.id+"' AND `deleted` = '0' AND `targetdate` BETWEEN '"+startDate+"' AND LAST_DAY('"+startDate+"')/ORDER BY `targetdate` DESC";
			
			$.getJSON(requestUrl, function(json){
				calendar.ui.eventcache = json.data;
				var monthStarted       = false;
				
				$("#calendarBody").datepicker("refresh");
				$("td").each(function(){
					var dayField  = $(this);
					var dayNumber = $(this).children().first().text();
					
					if(dayNumber == "1") monthStarted = ~monthStarted;
					
					if(monthStarted){
						if(dayNumber.length != 2) dayNumber = "0"+dayNumber;
						dayField
							.html(dayField.html().replace("a", "span"))
							.attr("id", "f"+year+"-"+month+"-"+dayNumber)
							.addClass("ui-datepicker-emptyday")
							.unbind()
							.click(function(){
								var thisDay   = $(this).children().first().text();
								var dayNumber = (parseInt(thisDay) < 10) ? ('0'+thisDay) : thisDay;
								
								system.addListener.handleLink("popup_scheduleview_"+calendar.ui.datescache+dayNumber);
							});
					}
				});
				if(!empty(calendar.ui.eventcache)) calendar.ui.appendData();
			});
		},
		
		appendData: function(){
			$.each(calendar.ui.eventcache, function(key, value){
				var targetField = $("#f"+value.targetdate);
				
				calendar.ui.appendSchedule(targetField, value);
				targetField.removeClass("ui-datepicker-emptyday")
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
		requestUrl += '`userid` = \''+system.user.me.id+'\' AND `deleted` = \'0\' AND `targetdate` >= CURDATE()/ORDER BY `targetdate` DESC';

		
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
				schedulestring += (val['scheduletype'] == "2") ? "error" : "";
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
		requestUrl = "./src/api/database/"+system.user.me.auth+"/read/schedule/`targetdate`='"+scheduledate+"' AND ";
		requestUrl += "`deleted` != '1' AND `userid`='"+system.user.me.id+"'";
		$.getJSON(requestUrl, function(json){
			$("#tdte").text($.datepicker.formatDate( "DD, d. MM yy", new Date(scheduledate.replace("-", ","))));
			
			htmlString = "";
			if(json.status == 4){
				$.each(json.data, function(key, value){
					htmlString += "<div class=\"calendarEntry\"><p class=\"scheduleDesc\"><span class=\"gray\"><i class=\"icon-bell\"></i> ";
					htmlString += (value.scheduletype == "2") ? "Prüfung" : "Aufgabe";
					htmlString += " <i class=\"icon-ticket\"></i> "+getSubjectById(value.subjectid)+"</span>";
					if(value.scheduletype == "2") htmlString += ' (<i class="icon-star"></i> '+value.mark+')';
					htmlString += '<span class=\"optionsi\"><a class="button" href="popup_scheduleedit_'+value.id+'"><i class="icon-wrench"></i> <span>Bearbeiten</span></a>';
					htmlString += '<a class="button" href="popup_scheduledelete_'+value.id+'"><i class="icon-remove"></i> <span>Löschen</span></a>';
					htmlString += "</span><br /><br />"+value.title+" <span class=\"small\">"+value.description+"</span></p>";
					htmlString += "<div class=\"hline\"></div></div>"
				});
			} else {
				htmlString += "Es wurden keine anstehenden Termine am "+chdate(scheduledate)+" gefunden.";
			}
			htmlString += "<a class=\"button popupsubmit\" onClick=\"system.addListener.handleLink('popup_scheduleadd')\"><i class=\"icon-add\"></i> Termin hinzufügen</a>";
			htmlString += "<div class=\"break\"></div>";
			
			$("#scheduleContainer").html(htmlString);
			system.addListener.ajaxLink();
		});
	},
	
	loadOne: function(scheduleid){
		requestUrl = "./src/api/database/"+system.user.me.auth+"/read/schedule/`id`='"+scheduleid+"'";
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
			$('#formSemesterEditInputMark').val(json.data[0]['mark']);
		});
	},
	
	/**
	 * @name scheduleAdd
	 * @desc Add an event to the database
	 * @param {int} type - The type of the new schedule (task / exam)
	 * @param {int} category - The id of the assigned category
	 * @param {string} title - The new schedule's title
	 * @param {string} desc - The new schedule's description
	 * @param {date} date - The new schedule's target date
	 */
	add: function(type, category, title, desc, date){
		if(!empty(type) && !empty(category) && !empty(title) && !empty(desc) && !empty(date)){
			requestUrl = "./src/api/database/"+system.user.me.auth+"/write/schedule/1/insert/";
			requestUrl += encodeURIComponent("`userid`='"+system.user.me.id+"', `subjectid`='"+category+"', ");
			requestUrl += encodeURIComponent("`scheduletype`='"+type+"', `title`='"+title+"', `description` = '"+desc+"', ");
			requestUrl += encodeURIComponent("`targetdate` = '"+date+"', `deleted` = '0'");
			
			$.getJSON(requestUrl, function(json){
				if(json.status == 4) system.page.reload();
				else system.form.output("ScheduleAdd", "error", "Beim hinzufügen des Termins ist ein Fehler aufgetreten");
			});
		} else {
			system.form.output("ScheduleAdd", "error", "Bitte füllen sie alle Felder mit einem gültigen Wert aus.");
		}
	},
	
	/**
	 * @name scheduleEdit
	 * @desc Edit an event to the database
	 * @param {int} type - The type of the new schedule (task / exam)
	 * @param {int} category - The id of the assigned category
	 * @param {string} title - The new schedule's title
	 * @param {string} desc - The new schedule's description
	 * @param {date} date - The new schedule's target date
	 */
	edit: function(type, category, title, desc, date, mark){
		if(!empty(type) && !empty(category) && !empty(title) && !empty(desc) && !empty(date) && !empty(mark)){
			requestUrl = "./src/api/database/"+system.user.me.auth+"/write/schedule/`id`='"+system.data+"'/update/";
			requestUrl += encodeURIComponent("`userid`='"+system.user.me.id+"', `mark`='"+parseFloat(mark)+"', ");
			requestUrl += encodeURIComponent("`subjectid`='"+category+"', `scheduletype`='"+type+"', `title`='"+title+"', ");
			requestUrl += encodeURIComponent("`description` = '"+desc+"', `targetdate` = '"+date+"', deleted = '0'");
			
			$.getJSON(requestUrl, function(json){
				if(json.status == 4) system.page.reload();
				else system.form.output("ScheduleAdd", "error", "Beim hinzufügen des Termins ist ein Fehler aufgetreten");
			});
		} else {
			system.form.output("ScheduleAdd", "error", "Bitte füllen sie alle Felder mit einem gültigen Wert aus.");
		}
	},
	
	/**
	 * @name scheduleDodelete
	 * @desc Delete an event from the database
	 * @param {int} scheduleid - The id of the respective event
	 */
	dodelete: function(scheduleid){
		requestUrl = "./src/api/database/"+system.user.me.auth+"/write/schedule/`id`='"+scheduleid+"'/update/`deleted`='1'";
		$.getJSON(requestUrl, function(json){
			if(json.status == 4) system.page.reload();
			else system.form.output("userdelete", "error", "Bei der Löschung des Termins ist ein Fehler aufgetreten.");
		});
	}
}