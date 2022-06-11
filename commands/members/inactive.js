export const command = {
	data: {
		name: 'inactive',
		description: 'Makes you inactive'
	},
	async execute(interaction) {
		const roleManager = interaction.member.roles;
		const PONG_ROLE = interaction.client.ROLES.PONG;
		const TOOM_ROLE = interaction.client.ROLES.TOOM;
		if (!roleManager.cache.has(TOOM_ROLE.id)) {
			await roleManager.remove(PONG_ROLE);
			await roleManager.add(TOOM_ROLE);
			await interaction.reply('Lazy smh');
		} else {
			await interaction.reply('You are already inactive');
		}
	}
};
