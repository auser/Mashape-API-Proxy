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

var cache = {users:[], actions: [], hosts:[]};

// Actions:

exports.saveAction = function(serverKey, publicKey, hash, uuid, clientLanguage, clientVersion, methodId, ip, requestSize) {
	var action = {"serverKey":serverKey, "publicKey":publicKey, "hash":hash, "uuid":uuid, "ip":ip, "creationDate": new Date().getTime(),"reported":false, "requestSize":requestSize};
	if (clientLanguage) {
		action.language = clientLanguage;
		if (clientVersion) {
			action.version = clientVersion;
		}
	}
	if (methodId) {
		action.methodId = methodId;
	}
	
	cache.actions.push(action);
	return action;
}

exports.getUserActions = function(serverKey, publicKey) {
	var actions = cache.actions;
	var numActions = actions.length;
	
	var userActions = [];
	for (var i=0;i<numActions;i++) {
		var action = actions[i];
		if (action.serverKey == serverKey && action.publicKey == publicKey) {
			userActions.push(action);
		}
	}
	return userActions;
}

exports.getUserActionsByHash = function(serverKey, publicKey, hash) {
	var actions = exports.getUserActions(serverKey, publicKey);
	
	var numActions = actions.length;
	var userActions = [];
	for (var i=0;i<numActions;i++) {
		var action = actions[i];
		if (action.hash == hash) {
			userActions.push(action);
		}
	}
	return userActions;
}

exports.setUserActionAsReported = function(action) {
	action.reported = true;
}

exports.getUnreportedUserActions = function() {
	var actions = cache.actions;
	var numActions = actions.length;
	
	var userActions = [];
	for (var i=0;i<numActions;i++) {
		var action = actions[i];
		if (!action.reported) {
			userActions.push(action);
		}
	}
	return userActions;
}

exports.getReportedUserActions = function() {
	var actions = cache.actions;
	var numActions = actions.length;
	
	var userActions = [];
	for (var i=0;i<numActions;i++) {
		var action = actions[i];
		if (action.reported) {
			userActions.push(action);
		}
	}
	return userActions;
}

exports.countUserActions = function(serverKey, publicKey, unit) {
	var userActions = exports.getUserActions(serverKey, publicKey);
	var numUserActions = userActions.length;
	
	var now = new Date().getTime();
	var lowerLimit = now - unit;
	var foundActions = [];
	for (var i=0;i<numUserActions;i++) {
		var userAction = userActions[i];
		if (userAction.creationDate >= lowerLimit && userAction.creationDate <= now) {
			foundActions.push(userAction);
		}
	}
	
	return foundActions.length;
}

exports.deleteAction = function(action) {
	var actions = cache.actions;
	var numActions = actions.length;
	for (var i=0;i<numActions;i++) {
		var curAction = actions[i];
		if (curAction.publicKey == action.publicKey && curAction.serverKey == action.serverKey) {
			cache.actions.splice(i, 1);
			return;
		}
	}
}

// Users:

exports.saveUser = function(publicKey, serverKey, data) {
	if (exports.getUser(publicKey) != null) {
		exports.deleteUser(publicKey);
	}
	var user = {"publicKey":publicKey, "serverKey":serverKey, "data":data};
	cache.users.push(user);
	return user;
}

exports.updateUser = function (user) {
	var gotUser = exports.getUser(user.publicKey, user.serverKey);
	if (gotUser != null) {
		gotUser.data = (user.data) ? user.data : null;
	}
}

exports.deleteUser = function(user) {
	var users = cache.users;
	var numUsers = users.length;
	for (var i=0;i<numUsers;i++) {
		var curUser = users[i];
		if (curUser.publicKey == user.publicKey && curUser.serverKey == user.serverKey) {
			cache.users.splice(i, 1);
			return;
		}
	}
}

exports.getUser = function(publicKey, serverKey) {
	var users = cache.users;
	var numUsers = users.length;
	for (var i=0;i<numUsers;i++) {
		var user = users[i];
		if (user.publicKey == publicKey && user.serverKey == serverKey) {
			return user;
		}
	}
	return null;
}

exports.countUsers = function() {
	return cache.users.length;
}

// Hosts:

exports.clearHosts = function() {
	cache.hosts = [];
}

exports.saveHost = function(address, serverKey, forwardHost, forwardPath, forwardPort, forwardSecure, authenticationAddon) {	
	if (exports.getHost(address) != null) {
		exports.deleteHost(address);
	}
	var host = {"address":address, "serverKey":serverKey, "forwardHost" : forwardHost, "forwardPath":forwardPath, "forwardPort":forwardPort,"forwardSecure":forwardSecure, "authenticationAddon":authenticationAddon};
	cache.hosts.push(host);
	return host;
}

exports.getHost = function(hostAddress) {
	var hosts = cache.hosts;
	var numHosts = hosts.length;
	for (var i=0;i<numHosts;i++) {
		var host = hosts[i];
		if (host.address == hostAddress) {
			return host;
		}
	}
	return null;
}

exports.getHostByServerKey = function(serverKey) {
	var hosts = cache.hosts;
	var numHosts = hosts.length;
	for (var i=0;i<numHosts;i++) {
		var host = hosts[i];
		if (host.serverKey == serverKey) {
			return host;
		}
	}
	return null;
}

exports.deleteHost = function(hostAddress) {
	var hosts = cache.hosts;
	var numHosts = hosts.length;
	for (var i=0;i<numHosts;i++) {
		var host = hosts[i];
		if (host.address == hostAddress) {
			cache.hosts.splice(i, 1);
			return;
		}
	}
}