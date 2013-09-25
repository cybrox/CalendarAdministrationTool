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
	 * Logout Klasse, Benutzer abmelden
	 *
	 * Diese Klasse ermöglicht das abmelden
	 * eines Benutzers unter Angabe seiner
	 * User-ID und seines Sicherheitsschlüssels
	 */
	class logout extends CatInterface implements apiElement {
		
		protected $database; 	// Datenbankelement
		
		
		
		/**
		 * Klassenkostruktor, Datenbankverbindung einbinden
		 *
		 * Baut eine Datenbankverbindung auf und verarbeitet
		 * den mitgesendeten Sicherheitsschlüssel-String
		 */
		public function __construct($requestParameters){
		
			$this->database = parent::databaseConnect();
		
			$requestedUserString = explode('-', $requestParameters[1]);
			$requestedUserToken  = $requestedUserString[0];
			$requestedUserUUID   = $requestedUserString[1];
			
			$this->userLogout($requestedUserToken, $requestedUserUUID);
		}
		
		/**
		 * Benutzer Logout, meldet einen Benutzer ab
		 *
		 * Prüft ob der entsprechende Benutzer angemeldet
		 * ist, trägt einen ungültigen Sicherheitsschlüssel
		 * ein und meldet den Benutzer ab ('active' = 0)
		 */
		private function userLogout($requestedUserToken, $requestedUserUUID){
			$requestedUser = $this->database->query("SELECT `name` FROM `".DATENBANK_PREFIX."user` WHERE `id` = '".$requestedUserUUID."' AND `token` = '".$requestedUserToken."'");
			
			if($requestedUser->num_rows === 1){
				
				$this->database->query("UPDATE `".DATENBANK_PREFIX."user` SET `token` = 'x', `active` = '0' WHERE `id` = '".$requestedUserUUID."'");
				
				parent::handleOutput("Logout erfolgreich");
				
			} else {
			
				parent::handleError("Kein Benutzer mit diesen Daten angemeldet");
			
			}
		}
	
	}

?>