<?php

	/**
	 * CAT Schnittstelle Hauptklasse
	 *
	 * Die CatInterface Klasse ist die Hauptklasse der
	 * API, sie wird bei jedem Aufruf verwendet um den
	 * Benutzer zu authntifizieren und eventuelle
	 * Unterklassen zur weiteren Datenverarbeitung zu
	 * laden und zu verwalten.
	 */
	class CatInterface{
		
		protected $status;		// Status der API Abfrage
		
		private $database;		// MySQLi Datenbankonjekt
		
		public $requestClass;	// Angeforderte Klasse
		public $requestToken;	// Übergeber Session-Token (Benutzername bei Login)
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
			$this->database = new mysqli(DATENBANK_HOSTADDR, DATENBANK_BENUTZER, DATENBANK_PASSWORT, DATENBANK_NAME);
		
			$this->requestClass = $requestParameter[0];
			$this->requestToken = $requestParameter[1];
			$this->requestThird = $requestParameter[2];
			
			$this->status = 1;
			
			$this->validateToken();
			$this->checkSubclass();
		}
		
		
		/**
		 * Klassendestruktor, Datenbankverbindung beenden
		 *
		 * Nach Abschluss aller Aktionen wird die Verbindung
		 * zur MySQL Datenbank automatisch beendet.
		 */
		public function __destruct(){
			$this->database->close();
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
			$requestedUser = $this->database->query("SELECT `id` FROM `cat_user` WHERE `name` = '".$this->requestToken."' AND `password` = '".$this->requestThird."'");
			
			if($requestedUser->num_rows === 1){
				$requestedUserData  = $requestedUser->fetch_assoc();
				$requestedUserId    = $requestedUserData['id'];
				$requestedUserToken = $this->generateToken();
				
				$this->database->query("UPDATE `cat_user` SET `token` = '".$requestedUserToken."', `active` = '1' WHERE `id` = '".$requestedUserId."'");
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
				
				$requestedUser = $this->database->query("SELECT `name` FROM `cat_user` WHERE `id` = '".$requestedUserUUID."' AND `token` = '".$requestedUserToken."'");
				
				if($requestedUser->num_rows === 1){
					echo 'a';
				} else {
					$this->handleError("Ungueltiger Token");
				}
			} else {
				$this->handleError("Ungueltiger Token-Syntax");
			}
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
				$this->status = 2;
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
			die('{"status": "'.$this->status.'", "error": "", "data": '.json_encode($data).'}');
		}
	}

?>