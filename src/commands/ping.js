import { ApplicationCommandType } from 'discord.js';

import { client } from '../index.js';

export const command = {
	data: {
		name: 'ping',
		description: 'Retrieves the ping',
		type: ApplicationCommandType.ChatInput
	},
	async execute(interaction) {
		const mechEmoji = client.emojis.cache.find(emoji => emoji.name === 'mechanistsSpin');
		const sent = await interaction.reply({ content: `Pong! ${mechEmoji}`, fetchReply: true });
		await interaction.editReply({ content: `Heartbeat ping: ${client.ws.ping}ms\nRoundtripy latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms` });
	}
};
