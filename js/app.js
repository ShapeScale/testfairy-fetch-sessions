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
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
const models_1 = require("./models");
const helpers_1 = require("./helpers");
const logs_1 = require("./logs");
const screenshots_1 = require("./screenshots");
const console_stamp = require('console-stamp');
const options_definitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'project-id', type: Number },
    { name: 'user', type: String },
    { name: 'api-key', type: String },
    { name: 'endpoint', type: String },
    { name: 'rsa-private-key', type: String },
    { name: 'logs' },
    { name: 'screenshots' },
    { name: 'video' },
    { name: 'days-since' },
    { name: 'show-touches' },
    { name: 'json' },
    { name: 'overwrite' },
];
class SessionsTool {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = new models_1.Options(options_definitions);
            if (options.containsHelp()) {
                this.help();
                return;
            }
            if (options.containsVersion()) {
                this.version();
                return;
            }
            console_stamp(console, 'HH:MM:ss.l');
            console.log("Fetching new sessions...");
            let daysSince = options.contains('days-since') ? options.daysSince() : 1;
            for (let start = daysSince; start > 0; start = start - 1) {
                let end = start - 1;
                console.log(`Query range days ${start} to ${end}`);
                let predicates = (0, helpers_1.makeProjectPredicates)(options);
                predicates.push({
                    type: 'date',
                    attribute: 'recorded_at',
                    comparison: 'gt',
                    value: `now-${start * 24}h/h`
                });
                predicates.push({
                    type: 'date',
                    attribute: 'recorded_at',
                    comparison: 'lt',
                    value: `now-${end * 24}h/h`
                });
                let sessions = yield (0, helpers_1.sessions)(predicates, options);
                if (sessions.length === 0) {
                    console.log("No new sessions found");
                }
                if (options.contains('logs')) {
                    console.log("Fetching logs");
                    yield (0, logs_1.logs)(sessions, options);
                }
                if (options.contains('screenshots') || options.contains('video')) {
                    console.log("Fetching session screenshots");
                    yield (0, screenshots_1.screenshots)(sessions, options);
                }
            }
        });
    }
    help() {
        // console.log("Usage: fetch-sessions-tool --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" --project-id=1000 [--logs] [--screenshots] [--video] [--rsa-private-key <path to RSA Private Key PEM file>]");
        // console.log("");
        // console.log("This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze");
        // console.log("sessions with your own toolchain or to import to your own analytics systems.");
    }
    version() {
        // console.log("fetch-sessions-tool version 1.3.1");
    }
}
const tool = new SessionsTool();
tool.run().catch((error) => { console.log(error.message); });
//# sourceMappingURL=app.js.map