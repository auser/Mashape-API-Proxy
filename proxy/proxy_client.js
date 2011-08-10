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
var http = require('http');
var https = require('https');
var http_client = require('./../http/http_client');

exports.doProxy = function (request, response, route, callback) {
	var options;
	var httpObject = http;
	var originalHeaders = request.headers;

	var clientIp;
	
	if (route.forwardSecure) {
		httpObject = https;
		clientIp = request.connection.socket.remoteAddress;
	} else {
		clientIp = request.socket.remoteAddress;
	}
	
	// Add Proxy headers
	originalHeaders["X-Forwarded-For"] = clientIp;
	originalHeaders["X-Forwarded-Host"] = originalHeaders["host"];
	
	// Remove Mashape headers
	delete originalHeaders["x-mashape-language"];
	delete originalHeaders["x-mashape-version"];
	delete originalHeaders["x-mashape-authorization"];
	delete originalHeaders["host"];
	delete originalHeaders["content-length"];
    delete originalHeaders["content-type"];
	delete originalHeaders["connection"];
	
	options = {  
		host: route.forwardHost,  
		port: route.forwardPort,
		path: route.forwardPath + request.url,
		method: request.method,
		headers: originalHeaders
	}

	var requestSize = 0;
	var proxy_request = httpObject.request(options, function(proxy_response) {
		proxy_response.addListener('data', function(chunk) {
			requestSize += chunk.length;
			response.write(chunk, 'binary');
		});
		proxy_response.addListener('end', function() {
			response.end();
			if (callback) {
				callback(options.host + options.path, requestSize);
			}
		});
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
	proxy_request.end();
}
