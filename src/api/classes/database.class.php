<?php
/* CAT - Calendar Administration Tool
** Database API database subclass
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/
	
	
	/**
	 * @namespace Database
	 * @class Database
	 * @desc The database class will handle all MySQLi database requests the user
	 *		 may perform expect for the login and logout requests.
	 */
	class database extends CatInterface implements apiElement {
		
		protected $database;		// MySQLi database object
		protected $userlvl;			// Requesting user's access level
		protected $userid;			// Requesting user's unique Id
		
		private $requestedAction;	// Requested database action
		private $requestedTables;	// Requested database table
		private $requestedFilter;	// Requested filter parameter
		private $requestedReType;	// Requested action type
		private $requestedInputs;	// Requested input data
		
		
		
		/**
		 * @method __construct
		 * @name constructor
		 * @desc Initialize a new database request, filter the parameters and
		 *		 perform the respective database action.
		 * @param {array} requestParameter - Request parameter array
		 * @param {int} accessLevel - Requesting user's access level
		 */
		public function __construct($requestParameters, $accessLevel){
			$this->database = parent::databaseConnect();
			$this->userlvl  = $accessLevel;
			
			$this->requestedAction = (!empty($requestParameters[2])) ? $requestParameters[2] : '' ;
			$this->requestedTables = (!empty($requestParameters[3])) ? $requestParameters[3] : '' ;
			$this->requestedFilter = (!empty($requestParameters[4])) ? urldecode($requestParameters[4]) : '' ;
			$this->requestedReType = (!empty($requestParameters[5])) ? $requestParameters[5] : '' ;
			$this->requestedInputs = (!empty($requestParameters[6])) ? urldecode($requestParameters[6]) : '' ;
			
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
		 * @method handleReadRequest
		 * @name Handle Read Request
		 * @desc Handle a database read request, this will generate the SQL query and
		 *		 send it to the connected database, it will output the returned data or
		 *		 an error if the returned resource is empty.
		 */
		private function handleReadRequest(){
			$this->checkInputs();
			
			$requestqQuery = "SELECT * FROM `".DATENBANK_PREFIX.$this->requestedTables."` WHERE ".urldecode($this->requestedFilter).$this->generateSecurityString()." ".urldecode($this->requestedReType);
			$requestedData = $this->database->query($requestqQuery);
			
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
		 * @method handleWriteRequest
		 * @name Handle Write Request
		 * @desc Handle a database write request, this will generate the SQL query
		 *		 depending on the given filters and parameters and input data. If the
		 *		 database returns an error, the method will output it, otherwise it will
		 *		 display a success message.
		 */
		private function handleWriteRequest(){
			$this->checkInputs();
			
			if(preg_match("#(INSERT|UPDATE)#i", $this->requestedReType)){
			
				if(empty($this->requestedInputs)) parent::handleError("Keine Daten uebergeben");
			
				$requestedAction = (preg_match("#INSERT#i", $this->requestedReType)) ? "INSERT INTO" : "UPDATE";
			
				$requestedQuery = $requestedAction." `".DATENBANK_PREFIX.$this->requestedTables."` SET ".urldecode($this->requestedInputs);
				if($requestedAction == "UPDATE") $requestedQuery.= " WHERE ".$this->requestedFilter.$this->generateSecurityString();
				
				$requestedData  = $this->database->query($requestedQuery);
				
				if(empty($this->database->error)) parent::handleOutput("Aktion erfolgreich");
				else parent::handleError($this->database->error);
			} else {
				parent::handleError("Ungueltige Aktion ausgewaehlt");
			}
		}
		
		
		/**
		 * @method checkInputs
		 * @name Check Inputs
		 * @desc Check the given input values, this will output an error if the user
		 *		 has no specified a table or a filte because these two values are
		 *		 needed in every type of request this class will handle.
		 */
		private function checkInputs(){
			if(empty($this->requestedTables)) parent::handleError("Keine Tabelle ausgewaehlt");
			if(empty($this->requestedFilter)) parent::handleError("Kein Filter ausgewaehlt");
		}
		
		
		/**
		 * @method generateSecurityString
		 * @name Generate Security String
		 * @desc In order to allow the administrator to view all user's data and
		 *		 to prevent normal users from reading other user's data, this
		 *		 method will generate a security string which will be added to the
		 *		 SQL query that will limit access to the requesting user's Id if this
		 *		 user is not an administrator.
		 */
		private function generateSecurityString(){
			if($this->userlvl == 2 || $this->requestedTables == "subject") return "";
			
			$reqtab = ($this->requestedTables == "user") ? "id" : "userid";
			
			return " AND `".$reqtab."` = '".$this->userid."'";	
		}
	}

?>