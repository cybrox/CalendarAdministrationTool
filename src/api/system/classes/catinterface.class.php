<?php
/* CAT - Calendar Administration Tool
** Database API main class
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/
	
	/**
	 * @namespace CatInterface
	 * @class CatInterface
	 * @desc The CAT interface' main class, this class will handle all incoming
	 *		 API requests and redirect them to the respective subclass.
	 *		 For additional information, please read the API Documentation file.
	 */
	class CatInterface{
		
		protected $status;		// Internal request status
		protected $sclass;		// Requested API subclass object
		protected $database;	// MySQLi database object
		protected $accessLevel;	// Requesting user's access level
		
		public $requestParms;	// Request parameter array
		public $requestClass;	// Requested subclass name
		public $requestToken;	// Requesting user's auth-token
		public $requestThird;	// Requested third-value (used for login)
		
		
		
		/**
		 * @method __construct
		 * @name constructor
		 * @desc Initialize a new API request, connect to the database,
		 *		 filter parameters, check user token and call subclass.
		 * @param {array} requestParameter - Request parameter array
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
		 * @method databaseConnect
		 * @name Database Connect
		 * @desc Connect to the configured database and set CHARSET
		 * @return {object} this::database - The mysqli database object
		 */
		protected function databaseConnect(){
			$this->database = new mysqli(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_NAME);
			
			$this->database->query("SET CHARACTER SET utf8");
			
			return $this->database;
		}
		
		
		/**
		 * @method validateToken
		 * @name Validate Token
		 * @desc Check if the user has requested a login action and perform a
		 *		 login request, validate the user's give auth-token otherwise.
		 */
		private function validateToken(){
			if($this->requestClass == "login"){
				$this->userLogin();
			} else {
				$this->userValidate();
			}
		}
		
		
		/**
		 * @method generateToken
		 * @name Generate Token
		 * @desc Generate a new user token, a token will be used to allow the user
		 *		 to perform further API requests, it contains 20 randomly generated
		 *		 characers including upper- and lowercased letters and numbers.
		 * @return {string} tokenStringy - The generated user token
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
		 * @method userLogin
		 * @name User Login
		 * @desc Send a new login request to the database and check if the user's
		 *		 given credentials are valid, generate and return a new auth-token
		 *		 and set the user active in the database if the login request was
		 *		 handled successfully.
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
		 * @method userValidate
		 * @name User Validate
		 * @desc Validate a user's auth token. This method will be called in every
		 *		 API request to check if the requesting user has the permission to
		 *		 perform the respective request. If the given auth-token is invalid,
		 *		 the system will output an error.
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
		 * @method checkSubclass
		 * @name Check Subclass
		 * @desc Check if the requested subclass is an existing PHP file and load
		 *		 it if this check was successful.
		 */
		private function checkSubclass(){
			if(file_exists('./classes/'.$this->requestClass.'.class.php')){
				$this->status = 3;
				
				include('./classes/'.$this->requestClass.'.class.php');
				$this->sclass = new $this->requestClass($this->requestParms, $this->accessLevel);
			} else {
				$this->handleError("Unterklasse existiert nicht");
			}
		}
		
		
		/**
		 * @method handleError
		 * @name Handle Error
		 * @desc Output an Error message and the current API status
		 */
		protected function handleError($error){
			die('{"status": "'.$this->status.'", "error": "'.$error.'", "data": ""}');
		}
		
		
		/**
		 * @method handleOutput
		 * @name Handle Output
		 * @desc Output a result message and the current API status
		 */
		protected function handleOutput($data){
			die('{"status": "4", "error": "", "data": '.json_encode($data, JSON_PRETTY_PRINT).'}');
		}
	}

?>