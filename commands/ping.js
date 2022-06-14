export const command = {
	data: {
		name: 'ping',
		description: 'Retrieves the ping',
		defaultPermission: 0
	},
	async execute(interaction) {
		const mechEmoji = interaction.client.emojis.cache.find(emoji => emoji.name == 'mechanistsSpin');
		const sent = await interaction.reply({ content: `Pong! ${mechEmoji}`, fetchReply: true });
		await interaction.editReply({ content: `Heartbeat ping: ${interaction.client.ws.ping}ms\nRoundtripy latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms` });
	}
};
