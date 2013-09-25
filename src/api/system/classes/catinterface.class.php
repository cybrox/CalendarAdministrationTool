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
	 * CAT Schnittstelle Hauptklasse
	 *
	 * Die CatInterface Klasse ist die Hauptklasse der
	 * API, sie wird bei jedem Aufruf verwendet um den
	 * Benutzer zu authentifizieren und eventuelle
	 * Unterklassen zur weiteren Datenverarbeitung zu
	 * laden und zu verwalten.
	 */
	class CatInterface{
		
		protected $status;		// Status der API Abfrage
		protected $sclass;		// Eingebundene Unterklasse
		protected $database;	// MySQLi Datenbankonjekt
		protected $accessLevel;	// Benutzerlevel
		
		public $requestParms;	// Anfrageparameter
		public $requestClass;	// Angeforderte Klasse
		public $requestToken;	// Übergebener Session-Token (Benutzername bei Login)
		public $requestThird;	// Übergebener Drittwert (Passwort bei Login)
		
		
		
		/**
		 * Klassenkonstruktor, Datenbankinitialisierung
		 *
		 * Die Datenbankklasse dieser Schnittstelle ist
		 * so konzipiert, dass das daraus erzeugte Objekt
		 * möglist selbstständig funktioniert, es sind
		 * kein weiteren Methodenaufrufe nötig.
		 */
		public function __construct($requestParameter){
			$this->databaseConnect();
			
			$this->requestParms = $requestParameter;
			$this->requestClass = $requestParameter[0];
			$this->requestToken = $requestParameter[1];
			$this->requestThird = $requestParameter[2];
			
			$this->status = 1;
			
			$this->validateToken();
			$this->checkSubclass();
			
			$this->database->close();
		}
		
		
		/**
		 * Datenbankverbindung herstellen
		 */
		protected function databaseConnect(){
			$this->database = new mysqli(DATENBANK_HOSTADDR, DATENBANK_BENUTZER, DATENBANK_PASSWORT, DATENBANK_NAME);
			
			return $this->database;
		}
		
		
		/**
		 * Sicherheitsschlüssel verifizieren
		 *
		 * Bei einer Loginanfrage werden die übergebenen
		 * Parameter entsprechend verarbeitet, in jedem
		 * anderen Fall wird geprüft ob der gesendete Token
		 * dem Benutzer zugeordnet ist und dieser bereits
		 * eingeloggt ist.
		 */
		private function validateToken(){
			if($this->requestClass == "login"){
				$this->userLogin();
			} else {
				$this->userValidate();
			}
		}
		
		
		/**
		 * Neuen Session-Token generieren
		 *
		 * Bei jedem Login wird für den Benutzer ein neuer
		 * Sicherheitsschlüssel (Token) generiert.
		 */
		private function generateToken(){
			$tokenCharset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
			$tokenStringy = "";
			
			for($i = 0; $i < 20; $i++){
				$tokenStringy .= $tokenCharset[rand(0, strlen($tokenCharset))];
			}
			
			return $tokenStringy;
		}
		
		
		/**
		 * Loginanfrage verarbeiten
		 *
		 * Prüft die vom Benutzer übergebenen Login
		 * Daten und generiert bei Erfolg einen neuen
		 * Session Token der in der Datenbank gespeichert
		 * wird, zudem wird der Benutzer in der
		 * Datenbank als "active" markiert.
		 */
		private function userLogin(){
			$requestedUser = $this->database->query("SELECT `id` FROM `".DATENBANK_PREFIX."user` WHERE `name` = '".$this->requestToken."' AND `password` = '".$this->requestThird."'");
			
			if($requestedUser->num_rows === 1){
				$requestedUserData  = $requestedUser->fetch_assoc();
				$requestedUserId    = $requestedUserData['id'];
				$requestedUserToken = $this->generateToken();
				
				$this->database->query("UPDATE `".DATENBANK_PREFIX."user` SET `token` = '".$requestedUserToken."', `active` = '1' WHERE `id` = '".$requestedUserId."'");
				$this->status = 4;
				$this->handleOutput(array("userid" => $requestedUserId, "token" => $requestedUserToken));
			} else {
				$this->handleError("Ungueltige Zugangsdaten");
			}
		}
		
		
		/**
		 * Übergebenenen Sicherheitsschlüssel prüfen
		 *
		 * Prüfen ob der übergebene Sicherheitsschlüssel
		 * mit der gegebenen Benutzer-ID überein stimmt
		 * und der Benutzer angemeldet ist.
		 */
		private function userValidate(){
			if(preg_match("#[A-z0-9]{18,22}\-[0-9]{1,}#", $this->requestToken)){
				
				$requestedToken = explode("-", $this->requestToken);
				$requestedUserToken = $requestedToken[0];
				$requestedUserUUID  = $requestedToken[1];
				
				$requestedUser = $this->database->query("SELECT `level` FROM `".DATENBANK_PREFIX."user` WHERE `id` = '".$requestedUserUUID."' AND `token` = '".$requestedUserToken."'");
				
				if($requestedUser->num_rows === 1){
				
					$requestedUserResponse = $requestedUser->fetch_assoc();
					
					$this->accessLevel = $requestedUserResponse['level'];
					$this->status = 2;
					
				} else {
					$this->handleError("Ungueltiger Token");
				}
			} else {
				$this->handleError("Ungueltiger Token-Syntax");
			}
		}
		
		
		/**
		 * Gibt den Benutzerlevel zurück
		 */
		protected function getAccessLevel(){
			return $this->accessLevel;
		}
		
		
		/**
		 * Prüfen ob die angeforderte Unterklasse existiert
		 *
		 * Da die API Modular aufgebaut ist, wir zuerst
		 * geprüft, ob die angefragte Unterklasse überhaupt
		 * existiert. Im Erfolgsfall wird sie eingebunden.
		 */
		private function checkSubclass(){
			if(file_exists('./classes/'.$this->requestClass.'.class.php')){
				$this->status = 3;
				
				include('./classes/'.$this->requestClass.'.class.php');
				$this->sclass = new $this->requestClass($this->requestParms);
			} else {
				$this->handleError("Unterklasse existiert nicht");
			}
		}
		
		
		/**
		 * Ausgabe eines Fehlers
		 *
		 * Beim Auftreten eines Fehlers in der API- oder
		 * einer Unterklasse wird der Fehler ausgegeben
		 * und die aktive Anfrage komplett beendet.
		 */
		protected function handleError($error){
			die('{"status": "'.$this->status.'", "error": "'.$error.'", "data": ""}');
		}
		
		
		/**
		 * Ausgabe einer Rückmeldung
		 *
		 * Nach erfolgreicher Verarbeitung einer Anfrage
		 * werden die Daten hier von der API ausgegeben.
		 * Danach wird die Anfrage beendet.
		 */
		protected function handleOutput($data){
			die('{"status": "4", "error": "", "data": '.json_encode($data).'}');
		}
	}

?>