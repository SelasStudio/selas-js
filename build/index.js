"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSelasClient = exports.SelasClient = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var SelasClient = /** @class */ (function () {
    function SelasClient(supabase) {
        this.supabase = supabase;
    }
    SelasClient.prototype.signIn = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase.auth.signIn({ email: email, password: password })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SelasClient.prototype.getCustomer = function (external_id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.from('customers').select('*').eq('external_id', external_id)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { error: "Customer ".concat(external_id, " unknown") }];
                        }
                        else {
                            return [2 /*return*/, { data: data[0] }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SelasClient.prototype.createCustomer = function (external_id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.from('customers').insert({ external_id: external_id })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { error: "Customer ".concat(external_id, " already exists") }];
                        }
                        else {
                            return [2 /*return*/, { data: { customer: data[0] }, message: "Customer ".concat(external_id, " created.") }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SelasClient.prototype.deleteCustomer = function (external_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.supabase.from('customers').delete().eq('external_id', external_id)];
            });
        });
    };
    SelasClient.prototype.addCredits = function (external_id, credits) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('provide_credits_to_customer', {
                            p_external_id: external_id,
                            p_nb_credits: credits,
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { error: error.message }];
                        }
                        else {
                            return [2 /*return*/, {
                                    data: { current_balance: data },
                                    message: "Added ".concat(credits, " credits to customer ").concat(external_id, ". Current balance: ").concat(data, " credits"),
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SelasClient.prototype.createToken = function (external_id, quota, ttl, description) {
        if (quota === void 0) { quota = 1; }
        if (ttl === void 0) { ttl = 60; }
        if (description === void 0) { description = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, token;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('create_token', {
                            target_external_id: external_id,
                            target_quota: quota,
                            target_ttl: ttl,
                            target_description: description,
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { error: error.message }];
                        }
                        else {
                            token = data;
                            return [2 /*return*/, {
                                    data: { token: token },
                                    message: "Token created for customer ".concat(external_id, " with quota ").concat(quota, " and scope customer."),
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SelasClient.prototype.postJob = function (config, token_key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, job;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc("post_job", { config: config, token_key: token_key })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        console.log(data, error);
                        job = data;
                        if (error) {
                            return [2 /*return*/, { error: error.message }];
                        }
                        else {
                            return [2 /*return*/, { data: { job: job }, message: "Job ".concat(job.id, " posted. Cost ").concat(job.job_cost, ".") }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SelasClient.prototype.runStableDiffusion = function (width, height, steps, guidance_scale, token_key) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                config = {
                    diffusion: {
                        width: width,
                        height: height,
                        steps: steps,
                        sampler: 'k_lms',
                        guidance_scale: guidance_scale,
                        io: {
                            image_format: 'avif',
                            image_quality: 100,
                            blurhash: false,
                        },
                    },
                };
                return [2 /*return*/, this.postJob(config, token_key)];
            });
        });
    };
    return SelasClient;
}());
exports.SelasClient = SelasClient;
var createSelasClient = function () {
    var SUPABASE_URL = 'https://rmsiaqinsugszccqhnpj.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E';
    var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
    return new SelasClient(supabase);
};
exports.createSelasClient = createSelasClient;
var test_function = function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                client = (0, exports.createSelasClient)();
                return [4 /*yield*/, client.signIn('benjamin@selas.studio', 'tromtrom')];
            case 1:
                _b.sent();
                return [4 /*yield*/, client.runStableDiffusion(512, 512, 100, 7.5)];
            case 2:
                _a = _b.sent(), data = _a.data, error = _a.error;
                console.log('data', data);
                // console.log('message', message);
                console.log('error', error);
                return [2 /*return*/];
        }
    });
}); };
test_function();
