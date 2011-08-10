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
var url = require('url');
var querystring = require('querystring');
var string_utils = require('./string_utils');

exports.getUrlParts = function(urlParam) {
	var result = { host : null, path : null, port : 80, secure : false}
		
	var urlObject = url.parse(urlParam);
	result.host = urlObject.hostname;
	result.port = parseInt(urlObject.port);
	if (isNaN(result.port)) {
		result.port = 80;
	}
	result.path = (urlObject.pathname == "/") ? "" : urlObject.pathname;
	if (urlObject.protocol == "http:" || urlObject.protocol == "https:") {
		result.secure = (string_utils.startsWith(urlObject.protocol, "https")) ? true : false;
	} else {
		log.error("Only HTTP or HTTPS are supported");
		throw new Error();
	}
		
	return result;
}