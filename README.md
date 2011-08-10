Mashape API Proxy
======================

Version
-------
Mashape API Proxy Version 1.2

Notes
-----
The API Proxy is open source and intended to be downloaded on your servers (on premise). We're currently testing the private version 1.2 with a small set of API providers. This new version dramatically improves the performance and the security of the proxy, while reducing consistently any latency.
We'll push it on GitHub as soon as has been tested properly. We recommend to wait for version 1.2 and skip version 1.1.

Requirements
============
The latest version of node.js installed (compiled with SSL support).

Usage
-----
Run the following command in a shell:

    node mashape-proxy.js --serverKey=YOUR_SERVER_KEY --forwardTo=FINAL_BASE_URL --port=PROXY_PORT
	
Copyright
---------
Copyright (C) 2011 Mashape, Inc.
