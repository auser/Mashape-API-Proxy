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
var http_client = require('./../http/http_client');
var constants = require('./../configuration/constants');
var mashape_utils = require('./../utils/mashape_utils');

exports.usageReport = function(callback, closeAnyways) {
	var actions = cache.getCache().getUnreportedUserActions();
	var postData = preparePostData(actions);
	// TODO: If actions.length == 0 don't make HTTP request, skip everything
	submitData(actions, JSON.parse(postData), closeAnyways, callback);
}

function preparePostData(actions) {
	var postData = '{';
	var numActions = actions.length;
	for (var i=0;i<numActions;i++) {
		var action = actions[i];
		var prepend = "\"usages[" + i + "].";
		var curData = '';
		for(var key in action) {
			curData += prepend;
			var value = action[key];
			if (!value) {
				value = null;
			}
			curData += key + "\":" + JSON.stringify(value) + ",";
	    }
		curData = curData.substring(0, curData.length - 1);
		postData += curData;
		if (i<numActions - 1) {
			postData += ",";
		}
	}
	postData+= "}";
	return postData;
}

function submitData(actions, postData, closeAnyways, callback) {
	var numActions = actions.length;
	http_client.doPost(constants.paths.API_MASHAPE, constants.paths.API_SAVEUSAGEINFO, constants.paths.API_PORT, postData, function(contentBody) {
		var jsonContentBody;
		try {
			jsonContentBody = JSON.parse(contentBody);
		} catch(err) {
			if (closeAnyways) {
				if (callback) {
					callback();
				}
			} else {
				log.error("An error occurred while submitting unreported actions to Mashape. The actions are still cached, trying to submit them again later");
			}
		}
		
		// Set the actions as "Reported"
		for (var i=0;i<numActions;i++) {
			cache.getCache().setUserActionAsReported(actions[i]);
		}
		log.info("Reported " + numActions + " User Actions");

		if (jsonContentBody) {
			// Read the response and update the user limits
			for(var i=0;i<jsonContentBody.users.length;i++) {
				var user = jsonContentBody.users[i];
				if (user.authorized) {
					user.data = user.apiLimit;
					delete user.authorized;
					delete user.apiLimit;
					delete user.status;
					cache.getCache().updateUser(jsonContentBody.users[i]);
				} else {
					// If the user is not authorized, delete it so that it will be reloaded at the next call (redoing first-call validation)
					cache.getCache().deleteUser(user);
				}
			}
		}
		if (callback) {
			callback();
		}	
	});
}

exports.cleanUpOldActions = function() {
	log.info("Cleaning up old cached User Actions");
	var actionsDeleted = 0;
	// Remove reported user actions based upon the user limit
	var actions = cache.getCache().getReportedUserActions();
	var numActions = actions.length;
	for (var i=0;i<numActions;i++) {
		var action = actions[i];
		if (action.publicKey != null) {
			var user = cache.getCache().getUser(action.publicKey, action.serverKey);
			if (user) {
				if (user.data) {
					var type = user.data.type;
					if (type) {
						var mashapeType = mashape_utils.getLimitType(type);
						var timeDifference = new Date().getTime() - action.creationDate;
						switch(mashapeType) {
							case constants.timeUnit.SECOND:
								if(timeDifference > 1000) {
									cache.getCache().deleteAction(action);
								}
								break;
							case constants.timeUnit.HOUR:
								if(timeDifference > 3600000) {
									cache.getCache().deleteAction(action);
								}
								break;
							case constants.timeUnit.DAY:
								if(timeDifference > 86400000) {
									cache.getCache().deleteAction(action);
								}
								break;
							case constants.timeUnit.MONTH:
								if(timeDifference > 2592000000) {
									cache.getCache().deleteAction(action);
								}
								break;
						}
						continue;
					}
				}
			}
		}
		
		// If the user has no limits set, then delete the action
	 //	cache.getCache().deleteAction(action);
		
		// TODO: If the request is global, support delete of global requests in cache (global request have no publicKey)
		
	}
	
	var curNumActions = cache.getCache().getReportedUserActions().length;
	log.info("Action cleaned up now: " + (numActions - curNumActions) + " - Awaiting to be cleaned: " + curNumActions);
	
}