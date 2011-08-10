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

var assert = require('assert');
var cache = require('./../../cache/base_memory_cache');
var constants = require('./../../configuration/constants');

exports.testAll = function(callback, index) {
	console.log("Executing: " + __filename);
	testSaveAction();
	testCountAction();
	testDeleteUser();
	if (callback) {
		callback(index);
	}
}

function sleep(ms) {
  var now = new Date().getTime();
  while(new Date().getTime() < now + ms) {
   // do nothing
  }
}

function testSaveAction() {
	cache.saveAction("SERKEY", "PUBKEY", "SOME-HASH", new Date().getTime());
	assert.equal(0, cache.getUserActions("", "PUBKEY").length);
	assert.equal(1, cache.getUserActions("SERKEY", "PUBKEY").length);
	assert.equal(1, cache.getUserActionsByHash("SERKEY", "PUBKEY", "SOME-HASH").length);
	assert.equal(0, cache.getUserActionsByHash("SERKEY", "PUBKEY", "SOME-HASH2").length);
}

function testCountAction() {	
	assert.equal(1, cache.getUserActions("SERKEY", "PUBKEY").length);
	
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.HOUR));
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.DAY));
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.MONTH));
	
	sleep(1100);
	assert.equal(0, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.HOUR));
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.DAY));
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.MONTH));
	
	cache.saveAction("SERKEY", "PUBKEY2", "SOME-HASH", new Date().getTime());
	cache.saveAction("SERKEY", "PUBKEY2", "SOME-HASH", new Date().getTime());
	assert.equal(0, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(2, cache.countUserActions("SERKEY", "PUBKEY2", constants.timeUnit.SECOND));
	cache.saveAction("SERKEY", "PUBKEY", "SOME-HASH", new Date().getTime());
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.SECOND));
	cache.saveAction("SERKEY2", "PUBKEY", "SOME-HASH", new Date().getTime());
	assert.equal(1, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(1, cache.countUserActions("SERKEY2", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(0, cache.countUserActions("SERKEY2", "PUBKEY2", constants.timeUnit.SECOND));
	
	sleep(1100);
	assert.equal(0, cache.countUserActions("SERKEY", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(0, cache.countUserActions("SERKEY2", "PUBKEY", constants.timeUnit.SECOND));
	assert.equal(0, cache.countUserActions("SERKEY2", "PUBKEY2", constants.timeUnit.SECOND));
	
	// Test invalid USER
	assert.equal(0, cache.countUserActions("", "PUBKEY", constants.timeUnit.SECOND));
}

function testDeleteUser() {
	assert.equal(0, cache.countUsers());
	cache.saveUser("PUB", "SER", null);
	assert.equal(1, cache.countUsers());
	
	var user = { serverKey : "SER", publicKey : "PUB"};
	cache.deleteUser(user);
	assert.equal(0, cache.countUsers());
}