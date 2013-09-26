/* CAT - Calendar Administration Tool
** Cascading Style Sheet, Hauptstyle
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
*/


/**
 * AJAX Loader für Ladeanzeige
 *
 * Beim laden einer neuen Seite oder neuen
 * Inhalten für die aktive Seite wird dem
 * Benutzer mittels einer Ladeanzeige suggeriert
 * zu warten. Diese wird hier generiert.
 */
$.loader = function(action){
	if(action == "show"){
		$('#loader').html("<div id=\"loading\"></div>");
		for(i = 0; i < 9; i++){
			$('#loading').append("<div></div>");
		}
	} else {
		$('#loader').html("");
	}
}

/**
 * Linkfunktionen ersetzen
 *
 * Links werden nun verwendet bla bla
 */
$('a').click(function(e){
	
	$.loader('show');
	
	link  = $(this).attr('href');
	parts = link.split('_');
	type  = parts[0];
	outpt = parts[1];
	
	switch(type){
		case "page":
			$('.userelement').removeClass('active');
			$(this).parent().addClass('active');
			
			$.ajax({
				type: 'GET',
				url: './src/page/'+outpt+'.html',
				success: function(data){
					$('#content').html(data);
					
					$.loader('hide');
				},
				error: function(xhr, status, error) {
					alert(error);
				}
			});
			break;
	}
	
	e.preventDefault();
});


/**
 * Userpanel, Steuerung des Benutzermenus
 *
 * Durch einen Klick auf den Benutzernamen kann der
 * Benutzer das Menu aufrufen, dabei wird der versteckte
 * Container per slideToggle langsam eingeblendet
 */
$('#userfieldVisible').click(function(){
	$('#userfieldHidden').slideToggle('fast');
	
	$('#userfieldIcon').toggleClass('userfieldIconRotate');
});








