import { client } from '../../index.js';

export const command = {
	data: {
		name: 'active',
		description: 'Makes you active/inactive'
	},
	async execute(interaction) {
		const roleManager = interaction.member.roles;
		const PONG_ROLE = client.ROLES.PONG;
		const TOOM_ROLE = client.ROLES.TOOM;
		if (roleManager.cache.has(TOOM_ROLE.id)) {
			await roleManager.remove(TOOM_ROLE);
			await roleManager.add(PONG_ROLE);
			await interaction.reply('Now active again');
		} else {
			await roleManager.remove(PONG_ROLE);
			await roleManager.add(TOOM_ROLE);
			await interaction.reply('Lazy smh');
		}
	}
};
