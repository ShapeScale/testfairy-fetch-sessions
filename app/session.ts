import * as fs from 'fs';
import request = require('request');
import FileSaver = require('file-saver');
import {ImageDownloader} from "./imageDownloader";
import {DownloadedSessionScreenshot} from "./sessionInterface";

const sprintf = require('sprintf-js').sprintf;

export class Session {
	private dirPath: string;
	private logFilePath: string;

	constructor(private endpoint: string, private httpOptions: any, private url: string) {
		this.dirPath = "testfairy-sessions" + url;
		this.logFilePath = this.dirPath + "/session.log"
	}

	log() {
		if (fs.existsSync(this.logFilePath)) {
			console.log(this.logFilePath + " already exists");
			return;
		}

		fs.mkdirSync(this.dirPath, {recursive: true});
		request.get("https://" + this.endpoint + "/api/1" + this.url + "?fields=logs", this.httpOptions, (error, res, log) => this.saveLogs(error, res, log));
	}

	private saveLogs(error: any, res: any, log: any) {
		fs.writeFileSync(this.dirPath + '/session.log', log);
	}

	screenshots(callback: (download?: DownloadedSessionScreenshot, error?: Error) => void) {
		fs.mkdirSync(this.dirPath, {recursive: true});
		const endpoint = "https://" + this.endpoint + "/api/1" + this.url + "?fields=events";
		request.get(endpoint, this.httpOptions, (error, res, events) => this.onScreenshotsUrls(error, res, events, callback));
	}

	private formatTimestamp(ts: number): string {
		return sprintf("%07.3f", ts); // 7 includes the point and 3
	}

	private onScreenshotsUrls(error: any, res: any, events: any, callback: (download?: DownloadedSessionScreenshot, error?: Error) => void) {
		if (error) {
			callback(undefined, error);
			return;
		}

		events = JSON.parse(events.toString());
		const imageDownloader = new ImageDownloader();
		const screenshotEvents = events.session.events.screenshotEvents;
		if (!screenshotEvents) {
			callback(undefined, new Error(`No screenshots found for session with id ${events.session.id}`));
			return;
		}
		var index = 0;
		for (let item of screenshotEvents) {
			let filePath = this.dirPath + "/" + this.formatTimestamp(item.ts) + ".jpg";

			const download: DownloadedSessionScreenshot = {
				id: events.session.id,
				session: this.url,
				url: item.url,
				timestamp: item.ts,
				filePath: filePath,
				imageIndex: index++,
				totalImages: screenshotEvents.length
			};

			if (fs.existsSync(filePath)) {
				console.log(filePath + " already exists");
				callback(download);
				continue;
			}

			imageDownloader.download(download, (error) => {
				callback(download, error);
			});
		}
	}
}
