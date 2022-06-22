import { Presence } from 'discord.js';
import {client} from "../../index.js";

export const command = {
	data: {
		name: 'startstreaming',
		description: 'Simulates a member starting to stream',
		defaultPermission: false
	},
	async execute(interaction) {
		const oldPresence = interaction.member.presence;
		const newPresence = new Presence(client, oldPresence);
		newPresence.activities = [{ type: 'STREAMING', state: 'Minecraft', details: 'playing the game lol', url: 'https://twitch.tv/commandleo' }];

		client.emit('presenceUpdate', oldPresence, newPresence);
		await interaction.reply('Started streaming');
	}
};
