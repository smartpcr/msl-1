/**
 * Copyright (c) 2012-2014 Netflix, Inc.  All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * User authentication data unit tests.
 * 
 * Successful calls to
 * {@link UserAuthenticationData#create(com.netflix.msl.util.MslContext, org.json.JSONObject)}
 * covered in the individual user authentication data unit tests.
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */

const EntityAuthenticationScheme = require('../../../../../core/src/main/javascript/entityauth/EntityAuthenticationScheme.js');
const UserAuthenticationScheme = require('../../../../../core/src/main/javascript/userauth/UserAuthenticationScheme.js');
const UserAuthenticationData = require('../../../../../core/src/main/javascript/userauth/UserAuthenticationData.js');
const MslEncodingException = require('../../../../../core/src/main/javascript/MslEncodingException.js');
const MslError = require('../../../../../core/src/main/javascript/MslError.js');
const MslUserAuthException = require('../../../../../core/src/main/javascript/MslUserAuthException.js');

const MockMslContext = require('../../../main/javascript/util/MockMslContext.js');

describe("UserAuthenticationData", function() {
    /** Key user authentication scheme. */
    var KEY_SCHEME = "scheme";
    /** Key user authentication data. */
    var KEY_AUTHDATA = "authdata";
	
    /** MSL context. */
    var ctx;
    /** MSL encoder factory. */
    var encoder;
    
    var initialized = false;
    beforeEach(function() {
        if (!initialized) {
            runs(function() {
                MockMslContext.create(EntityAuthenticationScheme.PSK, false, {
                    result: function(c) { ctx = c; },
                    error: function(e) { expect(function() { throw e; }).not.toThrow(); }
                });
            });
            waitsFor(function() { return ctx; }, "ctx", 900);
            runs(function() {
            	encoder = ctx.getMslEncoderFactory();
            	initialized = true;
            });
        }
    });
    
    it("no scheme", function() {
        var exception;
        runs(function() {
            var mo = encoder.createObject();
            mo.put(KEY_SCHEME + "x", UserAuthenticationScheme.EMAIL_PASSWORD.name);
            mo.put(KEY_AUTHDATA, encoder.createObject());
            UserAuthenticationData.parse(ctx, null, mo, {
                result: function() {},
                error: function(e) { exception = e; }
            });
        });
        waitsFor(function() { return exception; }, "exception", 100);
        
        runs(function() {
            var f = function() { throw exception; };
            expect(f).toThrow(new MslEncodingException(MslError.MSL_PARSE_ERROR));
        });
    });
    
    it("no authdata", function() {
        var exception;
        runs(function() {
	        var mo = encoder.createObject();
	        mo.put(KEY_SCHEME, UserAuthenticationScheme.EMAIL_PASSWORD.name);
	        mo.put(KEY_AUTHDATA + "x", encoder.createObject());
	        UserAuthenticationData.parse(ctx, null, mo, {
                result: function() {},
                error: function(e) { exception = e; }
            });
        });
        waitsFor(function() { return exception; }, "exception", 100);
        
        runs(function() {
            var f = function() { throw exception; };
            expect(f).toThrow(new MslEncodingException(MslError.MSL_PARSE_ERROR));
        });
    });
    
    it("unidentified scheme", function() {
        var exception;
        runs(function() {
	        var mo = encoder.createObject();
	        mo.put(KEY_SCHEME, "x");
	        mo.put(KEY_AUTHDATA, encoder.createObject());
	        UserAuthenticationData.parse(ctx, null, mo, {
                result: function() {},
                error: function(e) { exception = e; }
            });
        });
        waitsFor(function() { return exception; }, "exception", 100);
        
        runs(function() {
            var f = function() { throw exception; };
            expect(f).toThrow(new MslUserAuthException(MslError.UNIDENTIFIED_USERAUTH_SCHEME));
        });
    });
    
    it("authentication factory not found", function() {
        var ctx;
        runs(function() {
            MockMslContext.create(EntityAuthenticationScheme.PSK, false, {
                result: function(c) { ctx = c; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return ctx; }, "ctx", 100);
        
        var exception;
        runs(function() {
            ctx.removeUserAuthenticationFactory(UserAuthenticationScheme.EMAIL_PASSWORD);
            var mo = encoder.createObject();
            mo.put(KEY_SCHEME, UserAuthenticationScheme.EMAIL_PASSWORD.name);
            mo.put(KEY_AUTHDATA, encoder.createObject());
            UserAuthenticationData.parse(ctx, null, mo, {
                result: function() {},
                error: function(e) { exception = e; }
            });
        });
        waitsFor(function() { return exception; }, "exception", 100);

        runs(function() {
            var f = function() { throw exception; };
            expect(f).toThrow(new MslUserAuthException(MslError.USERAUTH_FACTORY_NOT_FOUND));
        });
    });
});