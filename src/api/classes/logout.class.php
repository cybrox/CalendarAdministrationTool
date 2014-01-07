<?php
/* CAT - Calendar Administration Tool
** Database API logout subclass
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/

	/**
	 * @namespace Logout
	 * @class Logout
	 * @desc Allows a user to log out from his account
	 */
	class logout extends CatInterface implements apiElement {
		
		protected $database;	// MySQLi database object
		
		
		
		/**
		 * @method __construct
		 * @name constructor
		 * @desc Will intialize a new database connection via the parent class,
		 *		 get the needed parameters and call the logout method.
		 */
		public function __construct($requestParameters, $accessLevel){
		
			$this->database = parent::databaseConnect();
		
			$requestedUserString = explode('-', $requestParameters[1]);
			$requestedUserToken  = $requestedUserString[0];
			$requestedUserUUID   = $requestedUserString[1];
			
			$this->userLogout($requestedUserToken, $requestedUserUUID);
		}
		
		
		/**
		 * @method logoutUser
		 * @name Logout User
		 * @desc Checks id the requested user exists and will write an invalid
		 *		 auth-token to the database to prevent further API requests. This
		 *		 will also delete the cookie previously stored in the user's browser.
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