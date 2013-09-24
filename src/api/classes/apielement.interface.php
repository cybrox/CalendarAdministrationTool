<?php

	interface apiElement {
		public function __construct($requestParameters);
		public function __destruct();
		
		public function handleError();
		public function outputResult();
	}

?>