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

	include('./system/config.php');
	include('./system/interfaces/apielement.interface.php');
	include('./system/classes/catinterface.class.php');
	
	/* Anfrageadresse auslesen */
	$apiRequestAddress = $_SERVER['REQUEST_URI'];
	$apiRequestParams  = str_replace(str_replace("index.php", "", $_SERVER['PHP_SELF']) ,"", $apiRequestAddress);
	$apiRequestParam   = explode('/', $apiRequestParams);
	
	$api = new CatInterface($apiRequestParam);
	
?>