import Schedule from 'node-schedule';
import {client, MECHANIST_DATA} from "./index.js";

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
		const presence = MECHANIST_DATA.botPresences[Math.floor(Math.random() * botPresences.length)];
		client.user.setPresence(presence);
	});
}
