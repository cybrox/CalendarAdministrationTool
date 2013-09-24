<?php

/* CAT - Calendar Administration Tool
** Datenbankschnittstelle http/https
**
** Autor: Sven Gehring
**
** Informationen zur Lizenz dieses Quellcodes
** finden sie in der beiliegenden LICENSE.md
**
** Für weitere Informationen zum Aufbau und der
** Verwendung dieser Schnittstelle, lesen sie
** bitte die API-Dokumentation, zu finden unter
** Link:  "http://cybrox.eu/project/cat/doc/"
** Datei: "#04 - Datenbankschnittstelle.docx"
*/

	/**
	 * Interface für Unterklassen
	 *
	 * Um eine Unterklasse korrekt aufrufen
	 * zu können, muss sie mindestens über
	 * einen Konstruktor verfügen, deshalb
	 * steht ein einfaches Interface zur
	 * Einbindung zur Verfügung.
	 */
	interface apiElement {
	
		/**
		 * Klassenkonstruktor
		 *
		 * Übergabe der Anfrageparameter an
		 * die verwendete Unterklasse.
		 */
		public function __construct($requestParameters);
		
	}

?>