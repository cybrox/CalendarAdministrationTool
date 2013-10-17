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
	 * Datenbankklasse, lesen und schreiben in der Datenbank
	 *
	 * Diese Klasse ermöglicht das lesen und schreiben
	 * von Einträgen in der Datenbank. Dazu gehören das
	 * auslesen, einfügen und modifizieren von Daten.
	 */
	class database extends CatInterface implements apiElement {
		
		protected $database; 	// Datenbankelement
		protected $userlvl;		// Benutzerlevel
		protected $userid;		// Benutzer ID
		
		private $requestedAction;
		private $requestedTables;
		private $requestedFilter;
		private $requestedReType;
		private $requestedInputs;
		
		
		
		/**
		 * Klassenkonstruktor, Datenbankverbindung herstellen
		 *
		 * Baut eine Datenbankverbindung auf und erkennt
		 * die vom Benutzer gewünschte Aktion
		 */
		public function __construct($requestParameters){
			$this->database = parent::databaseConnect();
			$this->userlvl  = parent::getAccessLevel();
			
			$this->requestedAction = $requestParameters[2];
			$this->requestedTables = $requestParameters[3];
			$this->requestedFilter = $requestParameters[4];
			$this->requestedReType = $requestParameters[5];
			$this->requestedInputs = $requestParameters[6];
			
			$thisisuserid = explode('-', $requestParameters[1]);
			$this->userid = $thisisuserid[1];
			
			if($this->requestedAction == "read"){
				$this->handleReadRequest();
			} else if($this->requestedAction == "write"){
				$this->handleWriteRequest();
			} else {
				parent::handleError("Ungueltige Datenbankaktion");
			}
		}
		
		
		/**
		 * Leseanfrage bearbeiten
		 *
		 * Bearbeitet eine Leseanfrage und gibt das Ergebnis
		 * im JSON Format an die Ausgabefunktion der Elternklasse
		 * zurück.
		 */
		private function handleReadRequest(){
		
			$this->checkInputs();
			
			$requestedData = $this->database->query("SELECT * FROM `".DATENBANK_PREFIX.$this->requestedTables."` WHERE ".urldecode($this->requestedFilter).$this->generateSecurityString());
			
			if($requestedData->num_rows >= 1){
				
				while($row = $requestedData->fetch_assoc()){
					$requestedDataOutput[] = $row;
				}
				
				parent::handleOutput($requestedDataOutput);
			} else {
				parent::handleError("Keine Daten empfangen");
			}
		}
		
		
		/**
		 * Ausführen einer Schreibanfrage
		 *
		 * Ermöglicht das schreiben neuer Datensätze
		 * so wie das bearbeiten bestehender Datensätze
		 * in der Datenbank.
		 */
		private function handleWriteRequest(){
		
			$this->checkInputs();
			
			if(preg_match("#(INSERT|UPDATE)#i", $this->requestedReType)){
			
				if(empty($this->requestedInputs)) parent::handleError("Keine Daten uebergeben");
			
				$requestedAction = (preg_match("#INSERT#i", $this->requestedReType)) ? "INSERT INTO" : "UPDATE";
			
				$requestedQuery = $requestedAction." `".DATENBANK_PREFIX.$this->requestedTables."` SET ".urldecode($this->requestedInputs);
				if($requestedAction == "UPDATE") $requestedQuery.= " WHERE ".$this->requestedFilter.$this->generateSecurityString();
				
				$requestedData  = $this->database->query($requestedQuery);
				
				if(empty($this->database->error)){
					parent::handleOutput("Aktion erfolgreich");
				} else {
					parent::handleError($this->database->error);
				}
			} else {
				parent::handleError("Ungueltige Aktion ausgewaehlt");
			}
		}
		
		
		/**
		 * Prüfen der Eingangswerte
		 *
		 * Prüft ob die für eine Abfrage nötigen Werte
		 * vorhanden sind, der Name der Tabelle und der
		 * Filter der anzuzeigenden Datensätze
		 */
		private function checkInputs(){
			if(empty($this->requestedTables)) parent::handleError("Keine Tabelle ausgewaehlt");
			if(empty($this->requestedFilter)) parent::handleError("Kein Filter ausgewaehlt");
		}
		
		
		/**
		 * Sicherheitsstring generieren
		 *
		 * Generiert einen String für das Abfragequery um
		 * zu verhidnern, dass ein Benutzer Daten anderer
		 * Benutzer auslesen kann.
		 */
		private function generateSecurityString(){
			
			if($this->userlvl == 2) return "";
			
			$reqtab = ($this->requestedTables == "user") ? "id" : "userid";
			
			return " AND `".$reqtab."` = '".$this->userid."'";
			
		}
	}

?>