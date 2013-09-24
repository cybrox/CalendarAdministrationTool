<?php


	/* Diese Konfigurationsdatei beinhaltet die bei der Installationen eingetragenen
	** Zugangsdaten für die verwendete MySQL Datenbank.
	**
	** Änderungen an diesen Daten können ihre Installtion dieser Software unbrauchbar
	** machen, folgen sie bei allfälligen Änderungen den Anweisungen zur Datenbankänderung
	** welche sie im Anhang der Installationsanleitung finden. */
	define("DATENBANK_HOSTADDR", "localhost");			// MySQL Hostadresse
	define("DATENBANK_BENUTZER", "ni31524_5sql16");		// MySQL Benutzername
	define("DATENBANK_PASSWORT", "028cdbe5");			// MySQL Passwort
	define("DATENBANK_NAME",     "ni31524_5sql16");		// MySQL Datenbankname
	
	
	/* Das Datenbankpräfix wird bei der Installation gesetzt und kann bei nachträglicher
	** Änderung zu kritischen Fehlern führen. Bitte bearbeiten sie diesen Wert nur, wenn
	** sie zuvor Änderungen an der Datenbank vorgenommen haben und über das entsprechende
	** Hintergrundwissen verfügen. */
	define("DATENBANK_PREFIX", "cat_");
	
	
	/* Das Multilogin ermöglicht es einem Benutzer von verschiedenen Standorten aus gleich-
	** zeitig eingeloggt zu sein. Diese Option ist standardmässig deaktiviert, da dies eine
	** Sicherheitslücke darstellt, wenn der Benutzer sich nicht manuell ausloggt. */
	define("OPTION_MULTILOGIN", false);

?>
