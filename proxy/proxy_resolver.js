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

var cache = require('./../cache/cache');
var mashape_configuration = require('./../configuration/configuration')
var mashape_errors = require('./../mashape/mashape_errors');
var url_utils = require('./../utils/url_utils');
var constants = require('./../configuration/constants');

exports.getHostInfo = function(request, response, configuration, callback) {
	var hostAddress = request.headers.host.split(":")[0];
	var host = cache.getCache().getHost(hostAddress);
	
	if (host == null) {
		if (configuration.proxyMode == constants.proxyMode.STANDALONE) {
			if (cache.getCache().getHostByServerKey(configuration.serverKey) == null) {
				mashape_configuration.requestInfoByServerKey(configuration.serverKey, function(host) {
					callback(host);
				});
			} else {
				mashape_errors.returnError(response, 400, mashape_errors.getErrorJSON(2001, "Can't execute the request"));
			}
		} else {
			var mashape_plugin = require(__dirname + "/.." + constants.paths.MASHAPE_PLUGIN_PATH);
			mashape_plugin.resolveHost(response, hostAddress, function(jsonContentBody) {
				if (mashape_errors.hasErrorsJSON(jsonContentBody)) {
					mashape_errors.returnError(response, 500, mashape_errors.getErrorJSON(jsonContentBody.error.code, jsonContentBody.error.message));
				} else {
					var serverKey = jsonContentBody.serverKey;
					var forwardTo = jsonContentBody.forwardTo;
					var urlParts = url_utils.getUrlParts(forwardTo);
					var host = cache.getCache().saveHost(hostAddress, serverKey, urlParts.host, urlParts.path, urlParts.port, urlParts.secure, jsonContentBody.authenticationAddon);
					callback(host);
				}
			});
		}
	} else {
		callback(host);
	}
}