<?php

	include('./system/config.php');
	include('./system/interfaces/apielement.interface.php');
	include('./system/classes//catinterface.class.php');
	
	/* Anrageadresse auslesen */
	$apiRequestAddress = $_SERVER['REQUEST_URI'];
	$apiRequestParams  = str_replace(str_replace("index.php", "", $_SERVER['PHP_SELF']) ,"", $apiRequestAddress);
	$apiRequestParam   = explode('/', $apiRequestParams);
	
	$api = new CatInterface($apiRequestParam);
	
?>