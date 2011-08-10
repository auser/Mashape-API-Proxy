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
var mashape_errors = require('./../mashape/mashape_errors');
var mashape_utils = require('./../utils/mashape_utils');

exports.validateLimits = function(response, data, callback) {
	if (data.data) {
		var limit = data.data.limit;
		var type = data.data.type;
		
		if (limit && type) {
			var numActions = cache.getCache().countUserActions(data.serverKey, data.publicKey, mashape_utils.getLimitType(type));
			if (numActions + 1 > limit) {
				mashape_errors.returnError(response, 200, mashape_errors.getErrorJSON(2002, "You've exceeded your limit, that is of " + limit + " " + type + " requests"));
			} else {
				callback();
			}
		}
	} else {
		// The user doesn't have a limit
		callback();
	}
}