/*
 * Mashape API Proxy.
 *
 * Copyright (C) 2011 Mashape, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * The author of this software is Mashape, Inc.
 * For any question or feedback please contact us at: support@mashape.com
 *
 */

var log = require('./logging/log');
var proxy_configuration = require('./configuration/configuration');
var http = require('http');
var cache = require('./cache/cache');
var proxy_client = require('./proxy/proxy_client');
var proxy_resolver = require('./proxy/proxy_resolver');
var mashape_validation = require('./mashape/mashape_validation');
var mashape_usagereport = require('./mashape/mashape_usagereport');
var mashape_logreport = require('./mashape/mashape_logreport');
var mashape_errors = require('./mashape/mashape_errors');
var mashape_authorization = require('./mashape/mashape_authorization');
var string_utils = require('./utils/string_utils');

log.info("Starting Mashape Proxy. Please wait...");

var count = 0;

proxy_configuration.loadConfiguration(function(configuration) {

	setInterval(mashape_usagereport.usageReport, 6000);
	setInterval(mashape_logreport.logReport, 15000);
	setInterval(proxy_configuration.update, 30000);
	setInterval(mashape_usagereport.cleanUpOldActions, 5000);

	http.createServer(function(request, response) {
		handleRequest(request, response, configuration);
	}).listen(configuration.port);
	log.info("Mashape Proxy started on port " + configuration.port + "\n");
	
 	if (configuration.ssl) {
		var https = require('https');
		var fs = fs = require('fs');
		
		var options = {
		  key: fs.readFileSync('mashape-proxy-key.pem'),
		  cert: fs.readFileSync('mashape-proxy-cert.pem')
		};
		
		https.createServer(options, function (request, response) {
			handleRequest(request, response, configuration);
		}).listen(configuration.sslPort);
		log.info("SSL Support started on port " + configuration.sslPort + "\n");
	}
	
});

function handleRequest(request, response, configuration) {
	var start = new Date().getTime();
	mashape_authorization.authorizeRequest(request, response, configuration, function(host, data) {
		mashape_validation.validateLimits(response, data, function() {
			proxy_client.doProxy(request, response, host, function(forwardUrl, requestSize) {
				// Save Action
				cache.getCache().saveAction(data.serverKey, data.publicKey, data.hash, data.uuid, data.language, data.version, data.methodId, data.ip, requestSize);
				logExecutionTime(start, forwardUrl, requestSize);
			});
		});
	});
}

function logExecutionTime(start, forwardUrl, requestSize) {
	count++;
	var end = new Date().getTime();
	
	log.info("Request [# " + count.toString() + "] proxied to " + forwardUrl + " [" + string_utils.bytesToSize(requestSize) + "] in: " + (end-start) + "ms");
}

process.on('SIGINT', function () {
	exitProxy(0);
});

process.on('SIGHUP', function () {
	exitProxy(0);
});

process.on('SIGTERM', function () {
	exitProxy(0);
});

/*
process.on('uncaughtException', function (err) {
	log.trace(err);
	// exitProxy(1);
});
*/

function exitProxy(code) {
	log.info("Exiting..");
	//TODO: try catch and force quit
	mashape_usagereport.usageReport(function() {
		mashape_logreport.logReport(function() {
			log.info("Bye");
			process.exit(code);
		});
	}, true);
}