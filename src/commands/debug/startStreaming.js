import { ApplicationCommandType, Presence, ActivityType } from 'discord.js';
import { client } from '../../index.js';

export const command = {
	data: {
		name: 'startstreaming',
		description: 'Simulates a member starting to stream',
		type: ApplicationCommandType.ChatInput
	},
	async execute(interaction) {
		const oldPresence = interaction.member.presence;
		const newPresence = new Presence(client, oldPresence);
		newPresence.activities = [{ type: ActivityType.Streaming, state: 'Minecraft', details: 'playing the game lol', url: 'https://twitch.tv/commandleo' }];

		client.emit('presenceUpdate', oldPresence, newPresence);
		await interaction.reply('Started streaming');
	}
};
