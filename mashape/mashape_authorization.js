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
var cache = require('./../cache/cache');
var crypt_utils = require('./../utils/crypt_utils');
var http_client = require('./../http/http_client');
var proxy_resolver = require('./../proxy/proxy_resolver');
var mashape_errors = require('./../mashape/mashape_errors');
var constants = require('./../configuration/constants');
var ip_utils = require('./../utils/ip_utils');

exports.authorizeRequest = function(request, response, configuration, callback) {
	var authorizationHeader = request.headers["x-mashape-authorization"];
	
	if (authorizationHeader == null || authorizationHeader == '') {
		mashape_errors.returnError(response, 200, mashape_errors.getErrorJSON(2001,"The authentication header \"X-Mashape-Authorization\" is missing"));
	} else {
		try {
			var authorizationParts = crypt_utils.decodeBase64(authorizationHeader).split(':');
		
			var publicKey = authorizationParts[0];
			var hash = authorizationParts[1].substring(0, 40);
			var uuid = authorizationParts[1].substring(40);
			var language = request.headers["x-mashape-language"];
			var version = request.headers["x-mashape-version"];
		
			proxy_resolver.getHostInfo(request, response, configuration, function(host) {
			
				var ip_address = ip_utils.getIp(request);
				var data = {
					"serverKey": (host.serverKey) ? host.serverKey : null,
				    "publicKey": (publicKey) ? publicKey : null,
					"hash": (hash) ? hash : null,
					"uuid": (uuid) ? uuid : null,
					"ip": (ip_address) ? ip_address : null,
					"route": request.url,
					"language": (language) ? language : null,
					"version": (version) ? version : null
				};
			
				var user = cache.getCache().getUser(publicKey, host.serverKey);
				if (user == null) {
					loadUser(response, data, function(loadedData) {
						callback(host, loadedData);
					});
				} else {
					if (cache.getCache().getUserActionsByHash(data.serverKey, data.publicKey, data.hash).length > 0) {
						// The same hash already exists
						mashape_errors.returnError(response, 200, mashape_errors.getErrorJSON(2003, "You've already used this hash."));
					} else {
						data.data = user.data;
						callback(host, data);
					}
				}			
			});
		} catch(err) {
			mashape_errors.returnError(response, 200, mashape_errors.getErrorJSON(2003, "Invalid \"X-Mashape-Authorization\" authentication header"));
		}
	}
}

function loadUser(response, data, callback) {
	http_client.doPost(constants.paths.API_MASHAPE, constants.paths.API_REQUESTUSERINFO, constants.paths.API_PORT, data, function(contentBody) {
		var jsonContentBody;
		try {
			jsonContentBody = JSON.parse(contentBody);
		} catch (err) {
			var error = "An invalid JSON response was returned by Mashape when requesting User Info";
			log.error(error);
			mashape_errors.returnError(response, 200, mashape_errors.getErrorJSON(2000, error));
		}
		if (jsonContentBody.authorized) {
			var user = cache.getCache().saveUser(data.publicKey, data.serverKey, jsonContentBody.apiLimit);
			data.data = (jsonContentBody.apiLimit) ? jsonContentBody.apiLimit : null;
			callback(data);
		} else {
			mashape_errors.returnError(response, 200, JSON.stringify(jsonContentBody.error));	
		}
	});
}