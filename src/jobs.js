import Schedule from 'node-schedule';

import { client } from './index.js';
import { ACTIVITIES, readJson } from '../../io.js';

const BOT_ACTIVITIES = readJson(ACTIVITIES);

export default async function jobs() {
	Schedule.scheduleJob('0 16 * * 6', () => {
		const BOARD_CHANNEL = client.CHANNELS.BOARD;
		const BOARD_ROLE = client.ROLES.BOARD;

		BOARD_CHANNEL.send(`${BOARD_ROLE} meeting in 1 hour`);
	});

	Schedule.scheduleJob('0 17 * * 6', () => {
		const BOARD_CHANNEL = client.CHANNELS.BOARD;
		const BOARD_ROLE = client.ROLES.BOARD;

		BOARD_CHANNEL.send(`${BOARD_ROLE} MEETING`);
	});

	Schedule.scheduleJob('0 0 * * *', () => {
		const activity = BOT_ACTIVITIES[Math.floor(Math.random() * BOT_ACTIVITIES.length)];
		client.user.setActivity(activity);
	});
}
