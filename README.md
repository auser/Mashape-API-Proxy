Mashape API Proxy
======================

Version
-------
Mashape API Proxy Version 1.2

Notes
-----
The API Proxy is open source and intended to work with the new version of Mashape (www.mashape.com), not deployed yet.

Requirements
============
The latest version of node.js installed (compiled with SSL support).

To support SSL, place these two files in the installation directory: `mashape-proxy-cert.pem` and `mashape-proxy-key.pem`

Usage
-----
Run the following command in a shell:

    node mashape-proxy.js --serverKey=YOUR_SERVER_KEY --port=PROXY_PORT --ssl --sslPort=SSL_PORT
	
Copyright
---------
Copyright (C) 2011 Mashape, Inc.
