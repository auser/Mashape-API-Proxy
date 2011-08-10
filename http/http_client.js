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
var querystring = require('querystring');

exports.doPost = function doPost(host, path, port, data, callback) {
	var content = querystring.stringify(data);
	
	var options = {  
	    host: host,  
	    port: port,  
	    path: path,  
	    method: 'POST',  
	    headers: {  
		'Content-Type': 'application/x-www-form-urlencoded',  
		'Content-Length': content.length,
		'Host': host
	    }
	}; 
	var httpObject = http;
	if (port == 443) {
		httpObject = https;
	}
	var http_request = httpObject.request(options, function(http_response) {
		exports.readContentBody(http_response, function(parameters) {
			if (callback) {
				callback(parameters);
			}
		});
	});
	
	http_request.on('error', function(e) {
		log.error(e);
		if (callback) {
			callback(e);
		}
	});
	
	http_request.write(content);
    http_request.end();
}

exports.readContentBody = function readContentBody(object, callback) {
	var contentBody = '';

	object.on('data', function(chunk) {
      		contentBody += chunk.toString();
    	});
	
	object.on('end', function() {
		if (callback) {
			callback(contentBody);
		}
	});
}
