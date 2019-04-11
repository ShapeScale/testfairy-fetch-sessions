"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
const sessions_1 = require("./sessions");
const console_stamp = require('console-stamp');
const commandline_args = require('command-line-args');
const options_definitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'project-id', type: Number },
    { name: 'user', type: String },
    { name: 'api-key', type: String },
    { name: 'endpoint', type: String },
    { name: 'logs' },
    { name: 'screenshots' },
];
console_stamp(console, 'HH:MM:ss.l');
class SessionsTool {
    static main() {
        const tool = new SessionsTool();
        tool.run();
    }
    run() {
        const options = commandline_args(options_definitions);
        this.assertNoMissingParams(options);
        const endpoint = options.endpoint;
        if (endpoint.indexOf(":") >= 0 || endpoint.indexOf("/") >= 0) {
            console.error("Invalid value for option \"endpoint\". Please supply only domain name, for example: \"mycompany.testfairy.com\".");
            this.help();
        }
        const auth = {
            "user": options["user"],
            "pass": options["api-key"]
        };
        const sessions = new sessions_1.Sessions(options['endpoint'], options['project-id'], auth);
        if (options['logs'] !== undefined) {
            sessions.logs();
        }
        if (options['screenshots'] !== undefined) {
            sessions.screenshots();
        }
    }
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    help() {
        console.log("Usage: fetch-sessions-tool --endpoint \"subdomain.testfairy.com\" --user \"email@example.com\" --api-key \"0123456789abcdef\" [--logs] [--screenshots]");
        console.log("");
        console.log("This tool downloads screenshots and/or logs from recorded TestFairy sessions. Use this to download data to analyze");
        console.log("with your own toolchain or to import to your own analytics systems.");
        process.exit(1);
    }
    assertNoMissingParams(options) {
        if (this.isEmpty(options) || options.help) {
            this.help();
        }
        const required = ["endpoint", "user", "api-key", "project-id"];
        for (var i = 0; i < required.length; i++) {
            var k = required[i];
            if (!(k in options)) {
                console.error("Missing value of option \"" + k + "\"");
                this.help();
            }
        }
        if (!("logs" in options) && !("screenshots" in options)) {
            console.error("Must provide at least of --logs or --screenshots");
            this.help();
        }
    }
}
SessionsTool.main();
