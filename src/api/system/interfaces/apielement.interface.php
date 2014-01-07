<?php
/* CAT - Calendar Administration Tool
** Database API subclass interface
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/


	/**
	 * Interface example for subclasses
	 *
	 * This is a small interface for additional
	 * API subclasses to define the embedding structure.
	 */
	interface apiElement {
		
		public function __construct($requestParameters, $accessLevel);
		
	}

?>