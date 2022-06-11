export const command = {
	data: {
		name: 'membercount',
		description: 'Returns the member count'
	},
	async execute(interaction) {
		await interaction.reply(interaction.guild.memberCount.toString());
	}
};
