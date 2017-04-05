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
 * ECC entity authentication data unit tests.
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */

const MslEncoderFormat = require('../../../../../core/src/main/javascript/io/MslEncoderFormat.js');
const EntityAuthenticationScheme = require('../../../../../core/src/main/javascript/entityauth/EntityAuthenticationScheme.js');
const EccAuthenticationData = require('../../../../../core/src/main/javascript/entityauth/EccAuthenticationData.js');
const EntityAuthenticationData = require('../../../../../core/src/main/javascript/entityauth/EntityAuthenticationData.js');
const RsaAuthenticationData = require('../../../../../core/src/main/javascript/entityauth/RsaAuthenticationData.js');
const MslEncodingException = require('../../../../../core/src/main/javascript/MslEncodingException.js');
const MslError = require('../../../../../core/src/main/javascript/MslError.js');

const MockMslContext = require('../../../main/javascript/util/MockMslContext.js');
const MockEccAuthenticationFactory = require('../../../main/javascript/entityauth/MockEccAuthenticationFactory.js');
const MslTestUtils = require('../../../main/javascript/util/MslTestUtils.js');

describe("EccAuthenticationData", function() {
    /** MSL encoder format. */
    var ENCODER_FORMAT = MslEncoderFormat.JSON;
    
    /** Key entity authentication scheme. */
    var KEY_SCHEME = "scheme";
    /** Key entity authentication data. */
    var KEY_AUTHDATA = "authdata";
    /** Key entity identity. */
    var KEY_IDENTITY = "identity";
    /** Key public key ID. */
    var KEY_PUBKEY_ID = "pubkeyid";

    /** MSL context. */
    var ctx;
    /** MSL encoder factory. */
    var encoder;
    
    var initialized = false;
    beforeEach(function() {
        if (!initialized) {
            runs(function() {
                MockMslContext.create(EntityAuthenticationScheme.X509, false, {
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
    
    it("ctors", function() {
        var data = new EccAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
        expect(data.getIdentity()).toEqual(MockEccAuthenticationFactory.ECC_ESN);
        expect(data.publicKeyId).toEqual(MockEccAuthenticationFactory.ECC_PUBKEY_ID);
        expect(data.scheme).toEqual(EntityAuthenticationScheme.ECC);
        
        var authdata;
        runs(function() {
            data.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { authdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); },
            });
        });
        waitsFor(function() { return authdata; }, "authdata", 100);
        
        var encode;
        runs(function() {
            expect(authdata).not.toBeNull();
            data.toMslEncoding(encoder, ENCODER_FORMAT, {
                result: function(x) { encode = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return encode; }, "encode", 100);
        
        var moData, moAuthdata;
        runs(function() {
            expect(encode).not.toBeNull();
        
            moData = EccAuthenticationData.parse(authdata);
            expect(moData.getIdentity()).toEqual(data.getIdentity());
            expect(moData.publicKeyId).toEqual(data.publicKeyId);
            expect(moData.scheme).toEqual(data.scheme);
            moData.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { moAuthdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return moAuthdata; }, "moAuthdata", 100);

        var moEncode;
        runs(function() {
            expect(moAuthdata).not.toBeNull();
            expect(moAuthdata).toEqual(authdata);
            moData.toMslEncoding(encoder, ENCODER_FORMAT, {
                result: function(x) { moEncode = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return moEncode; }, "moEncode", 100);
        
        runs(function() {
            expect(moEncode).not.toBeNull();
            expect(moEncode).toEqual(encode);
        });
    });
    
    it("mslobject is correct", function() {
        var data = new EccAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
        var mo;
        runs(function() {
            MslTestUtils.toMslObject(encoder, data, {
                result: function(x) { mo = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return mo; }, "mo", 100);
        
        runs(function() {
            expect(mo.getString(KEY_SCHEME)).toEqual(EntityAuthenticationScheme.ECC.name);
            var authdata = mo.getMslObject(KEY_AUTHDATA, encoder);
            expect(authdata.getString(KEY_IDENTITY)).toEqual(MockEccAuthenticationFactory.ECC_ESN);
            expect(authdata.getString(KEY_PUBKEY_ID)).toEqual(MockEccAuthenticationFactory.ECC_PUBKEY_ID);
        });
    });
    
    it("create", function() {
        var data = new EccAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
        
        var encode;
        runs(function() {
            data.toMslEncoding(encoder, ENCODER_FORMAT, {
                result: function(x) { encode = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return encode; }, "encode", 100);
        
        var mo;
        runs(function() {
            MslTestUtils.toMslObject(encoder, data, {
                result: function(x) { mo = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return mo; }, "mo", 100);
        
        var entitydata;
        runs(function() {
            EntityAuthenticationData.parse(ctx, mo, {
                result: function(x) { entitydata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); },
            });
        });
        waitsFor(function() { return entitydata }, "entitydata", 100);
        
        var moData, moAuthdata;
        runs(function() {
            expect(entitydata).not.toBeNull();
            expect(entitydata instanceof EccAuthenticationData).toBeTruthy();
            
            moData = entitydata;
            expect(moData.getIdentity()).toEqual(data.getIdentity());
            expect(moData.publicKeyId).toEqual(data.publicKeyId);
            expect(moData.scheme).toEqual(data.scheme);
            moData.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { moAuthdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return moAuthdata; }, "moAuthdata", 100);
        
        var authdata;
        runs(function() {
            data.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { authdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); },
            });
        });
        waitsFor(function() { return authdata; }, "authdata", 100);
        
        var moEncode;
        runs(function() {
            expect(moAuthdata).not.toBeNull();
            expect(moAuthdata).toEqual(authdata);
            moData.toMslEncoding(encoder, ENCODER_FORMAT, {
                result: function(x) { moEncode = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return moEncode; }, "moEncode", 100);
        
        runs(function() {
            expect(moEncode).not.toBeNull();
            expect(moEncode).toEqual(encode);
        });
    });
    
    it("missing identity", function() {
        var authdata;
        runs(function() {
            var data = new EccAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
            data.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { authdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); },
            });
        });
        waitsFor(function() { return authdata; }, "authdata", 100);
        
        runs(function() {
            authdata.remove(KEY_IDENTITY);
            var f = function() {
                EccAuthenticationData.parse(authdata);
            };
            expect(f).toThrow(new MslEncodingException(MslError.MSL_PARSE_ERROR));
        });
    });

    it("missing pubkey id", function() {
        var authdata;
        runs(function() {
            var data = new EccAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
            data.getAuthData(encoder, ENCODER_FORMAT, {
                result: function(x) { authdata = x; },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); },
            });
        });
        waitsFor(function() { return authdata; }, "authdata", 100);
        
        runs(function() {
            authdata.remove(KEY_PUBKEY_ID);
            var f = function() {
                EccAuthenticationData.parse(authdata);
            };
            expect(f).toThrow(new MslEncodingException(MslError.MSL_PARSE_ERROR));
        });
    });
    
    it("equals identity", function() {
        var dataA, dataB, dataA2;
        runs(function() {
            var identityA = MockEccAuthenticationFactory.ECC_ESN + "A";
            var identityB = MockEccAuthenticationFactory.ECC_ESN + "B";
            dataA = new RsaAuthenticationData(identityA, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
            dataB = new RsaAuthenticationData(identityB, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
            MslTestUtils.toMslObject(encoder, dataA, {
                result: function(mo) {
                    EntityAuthenticationData.parse(ctx, mo, {
                        result: function(x) { dataA2 = x; },
                        error: function(e) { expect(function() { throw e; }).not.toThrow(); }
                    });
                },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return dataA && dataB && dataA2; }, "data", 100);
        
        runs(function() {
            expect(dataA.equals(dataA)).toBeTruthy();
            
            expect(dataA.equals(dataB)).toBeFalsy();
            expect(dataB.equals(dataA)).toBeFalsy();
            
            expect(dataA.equals(dataA2)).toBeTruthy();
            expect(dataA2.equals(dataA)).toBeTruthy();
        });
    });
    
    it("equals pubkeyid", function() {
        var dataA, dataB, dataA2;
        runs(function() {
            var pubkeyidA = MockEccAuthenticationFactory.ECC_PUBKEY_ID + "A";
            var pubkeyidB = MockEccAuthenticationFactory.ECC_PUBKEY_ID + "B";
            dataA = new RsaAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, pubkeyidA);
            dataB = new RsaAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, pubkeyidB);
            MslTestUtils.toMslObject(encoder, dataA, {
                result: function(mo) {
                    EntityAuthenticationData.parse(ctx, mo, {
                        result: function(x) { dataA2 = x; },
                        error: function(e) { expect(function() { throw e; }).not.toThrow(); }
                    });
                },
                error: function(e) { expect(function() { throw e; }).not.toThrow(); }
            });
        });
        waitsFor(function() { return dataA && dataB && dataA2; }, "data", 100);
        
        runs(function() {
            expect(dataA.equals(dataA)).toBeTruthy();

            expect(dataA.equals(dataB)).toBeFalsy();
            expect(dataB.equals(dataA)).toBeFalsy();

            expect(dataA.equals(dataA2)).toBeTruthy();
            expect(dataA2.equals(dataA)).toBeTruthy();
        });
    });
    
    it("equals object", function() {
        var data = new EccAuthenticationData(MockEccAuthenticationFactory.ECC_ESN, MockEccAuthenticationFactory.ECC_PUBKEY_ID);
        expect(data.equals(null)).toBeFalsy();
        expect(data.equals(KEY_IDENTITY)).toBeFalsy();
    });
});
