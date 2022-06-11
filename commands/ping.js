export const command = {
	data: {
		name: 'ping',
		description: 'Retrieves the ping',
		defaultPermission: 0
	},
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pong! <a:mechanistsSpin:973512320959533056>', fetchReply: true });
		await interaction.editReply({ content: `Heartbeat ping: ${interaction.client.ws.ping}ms\nRoundtripy latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms` });
	}
};
