<?php
/* CAT - Calendar Administration Tool
** Database API index file
**
** Author: Sven Gehring
**
** Default copyright laws apply on this code.
** You may not copy, share, edit nor create
** any derivated work from this or any other
** file in this project.
*/

	
	include('./system/config.php');
	include('./system/interfaces/apielement.interface.php');
	include('./system/classes/catinterface.class.php');
	
	
	/* Read request URL and get parameter array */
	$apiRequestAddress = $_SERVER['REQUEST_URI'];
	$apiRequestParams  = str_replace(str_replace("index.php", "", $_SERVER['PHP_SELF']) ,"", $apiRequestAddress);
	$apiRequestParam   = explode('/', $apiRequestParams);

	/* Start new API request */
	$api = new CatInterface($apiRequestParam);
	
?>