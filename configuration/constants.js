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

var BASE_API_PATH = "/mashape-api";

exports.paths = {
	MASHAPE_PLUGIN_PATH : "/plugins/mashape-plugin.js",
	API_MASHAPE : "localhost",
	API_PORT: 8080,
	API_REQUESTINFOBYSERVERKEY: BASE_API_PATH + "/requestInfoByServerKey",
	API_REQUESTINFOBYADDRESS: BASE_API_PATH + "/requestInfoByAddress",
	API_REQUESTUSERINFO : BASE_API_PATH + "/requestUserInfo",
	API_SAVEUSAGEINFO : BASE_API_PATH + "/saveUsageInfo"
}

exports.proxyMode = {
	STANDALONE : "STANDALONE",
	MASHAPE : "MASHAPE"
}

exports.timeUnit = {
	SECOND : 1000,
	HOUR : 3600000,
	DAY : 86400000,
	MONTH : 2592000000
}