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

var log = require('./../logging/log');
var url_utils = require('./../utils/url_utils');
var http_client = require('./../http/http_client');
var mashape_errors = require('./../mashape/mashape_errors');
var cache = require('../cache/cache');
var constants = require('./constants');
var file_utils = require('./../utils/file_utils');
var string_utils = require('./../utils/string_utils');

var os = require('os');

var ARG_SERVERKEY = "--serverKey";
var ARG_PORT = "--port";
var ARG_SSL = "--ssl";
var ARG_SSLPORT = "--sslport";

var configuration = {port:80, proxyMode:null, serverKey:null, authenticationAddon:false, ssl:false, sslPort:443};

exports.loadConfiguration = function(callback) {
	log.info("Loading configuration..\n");
	
	log.info("- Hostname: " + os.hostname());
	log.info("- Total memory: " + string_utils.getMb(os.totalmem()) + " - Free memory: " + string_utils.getMb(os.freemem()));
	
	cache.loadCache(cache.handler.BASE_MEMORY);
	
	initConfiguration(function () {
		callback(configuration);
	});
}

function initConfiguration(callback) {
	var serverKey = loadArgs();
	log.info("- Proxy server HTTP port: " + configuration.port);
	if (configuration.ssl) {
		log.info("- Proxy server SSL port: " + configuration.sslPort);
	} else {
		log.info("- SSL support disabled");
	}
	if (serverKey) {
		configuration.serverKey = serverKey;
		configuration.proxyMode = constants.proxyMode.STANDALONE;
		log.info("- Proxy Mode: " + configuration.proxyMode);
		log.info("- Server Key: " + configuration.serverKey);
		exports.requestInfoByServerKey(configuration.serverKey, function() {
			var host = cache.getCache().getHostByServerKey(configuration.serverKey);	
			log.info("- DNS CNAME: " + host.address);
			log.info("- Forwarding to host: " + host.forwardHost);
			log.info("- Forwarding to port: " + host.forwardPort);
			log.info("- Forwarding to path: " + host.forwardPath);
			log.info("- Forwarding to SSL protocol: " + host.forwardSecure);
			log.info("- Authentication Add-on: " + host.authenticationAddon);
			callback();
		});
	} else {
		if (file_utils.existFile(__dirname + "/.." + constants.paths.MASHAPE_PLUGIN_PATH)) {
			configuration.proxyMode = constants.proxyMode.MASHAPE;
			log.info("- Proxy Mode: " + configuration.proxyMode);
			callback();
		} else {
			log.error("Argument missing: " + ARG_SERVERKEY);
			process.exit(1);
		}
	}
}

function loadArgs() {
	var serverKey = null;
	var arguments = process.argv;
	for (i=0;i<arguments.length;i++) {
		var argument = arguments[i];
		if (string_utils.startsWith(argument, ARG_SERVERKEY)) {
			serverKey = getArgumentValue(argument);
		} else if (string_utils.startsWith(argument, ARG_PORT)) {
			try {
				configuration.port = parseInt(getArgumentValue(argument));
				if (isNaN(configuration.port)) {
					throw new Error();
				}
			} catch (err) {
				log.error("Argument error: invalid " + ARG_PORT + " value");
				process.exit(1);	
			}
		} else if (string_utils.startsWith(argument, ARG_SSLPORT)) {
			try {
				configuration.sslPort = parseInt(getArgumentValue(argument));
				if (isNaN(configuration.sslPort)) {
					throw new Error();
				}
			} catch (err) {
				log.error("Argument error: invalid " + ARG_SSLPORT + " value");
				process.exit(1);	
			}
		} else if (string_utils.startsWith(argument, ARG_SSL)) {
			configuration.ssl = true;
		}
	}
	return serverKey;
}

function getArgumentValue(argument) {
	var parts = argument.split("=");
	if (parts.length > 1) {
		return argument.split("=")[1];
	}
	return null;
}

exports.requestInfoByServerKey = function(serverKey, callback) {
	http_client.doPost(constants.paths.API_MASHAPE, constants.paths.API_REQUESTINFOBYSERVERKEY, constants.paths.API_PORT, {"serverKey":serverKey}, function(contentBody) {
		var jsonContentBody;
		try {
			jsonContentBody = JSON.parse(contentBody);
		} catch (err) {
			log.error("Invalid response by: " + constants.paths.API_MASHAPE);
			process.exit(1);
		}
		var error = jsonContentBody.error;
		if (error) {
			log.error("Error " + error.code + ": " + error.message);
			process.exit(1);
		} else {
			var forwardTo = jsonContentBody.forwardTo;
			var urlParts = url_utils.getUrlParts(forwardTo);
			var host = cache.getCache().saveHost(jsonContentBody.cname, serverKey, urlParts.host, urlParts.path, urlParts.port, urlParts.secure, jsonContentBody.authenticationAddon);
			callback(host);
		}
	});
}

exports.update = function(configuration, callback) {
	log.info("Updating configuration from Mashape");

	cache.getCache().clearHosts();

	if (callback) {
		callback();
	}
}