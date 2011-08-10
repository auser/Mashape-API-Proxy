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
var string_utils = require('./../utils/string_utils');


var logData = null;

var logType = {
	INFO : "INFO",
	TRACE : "TRACE",
	ERROR : "ERROR"
}

exports.trace = function(text) {
	writeLog(logType.TRACE, text);
}

exports.error = function(text) {
	writeLog(logType.ERROR, text);
}

exports.info = function(text) {
	writeLog(logType.INFO, text);
}

exports.clearData = function() {
	logData = null;
}

function writeLog(type, text) {
	var log = type + " [" + getPrefix() + "] " + text;
	if (logData == null) {
		logData = '';
	}
	logData += log + "\n";
	switch (type) {
		case logType.INFO:
			console.info(log);
			break;
		case logType.ERROR:
			console.error(log);
			break;
		case logType.TRACE:
			console.trace(log);
			break;
	}
}

function getPrefix() {
	return new Date() + " MemUsage: " + string_utils.getMb(process.memoryUsage().heapUsed);
}