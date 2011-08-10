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
console.log("Executing tests..\n");
var start = new Date().getTime();
var tests = [
	"./cache/base_memory_cache_test"
	//"./http/http_client_test"
]

var executing = true;
executeTest(0);
while(executing) {
	// Do nothing
}

function executeTest(index) {
	if (index < tests.length) {
		require(tests[index]).testAll(executeTest, index + 1);
	} else {
		console.log("\nTest Results: " + tests.length + " tests were successfully executed in " + (new Date().getTime() - start) + "ms");
		executing = false;
	}
}