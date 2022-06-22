import env from "dotenv";
import {existsSync, readFileSync, writeFile} from "fs";

const ROOT = process.cwd();

const MECHANIST_PATH = `${ROOT}/data/mechanists.json`;
const FAQ = `${ROOT}/data/faq.json`;
const ACTIVITIES = `${ROOT}/data/activities.json`;

const CONFIG = `${ROOT}/config.json`;

// Load the .env file
env.config()

function readJson(path) {
	if (!existsSync(path)) {
		console.error("File not found:", path);
		process.exit(1);
	}
	return JSON.parse(readFileSync(path).toString());
}

function writeJson(path, data) {
	if (!existsSync(path)) {
		console.error("File not found:", path);
		process.exit(1);
	}
	writeFile(path, data, (error) => console.log(error));
}

export { MECHANIST_PATH, FAQ, ACTIVITIES, CONFIG, readJson, writeJson};