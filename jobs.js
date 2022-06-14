import fs from 'fs/promises';
import Schedule from 'node-schedule';

const config = JSON.parse(await fs.readFile('./config.json'));

export default async function jobs(client) {
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
		const presence = config.botPresences[Math.floor(Math.random() * botPresences.length)];
		client.user.setPresence(presence);
	});
}
