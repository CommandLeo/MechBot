const questions = {
	'Pigman Xp Farm': { files: ['https://cdn.discordapp.com/attachments/647255354693910552/812275888917708810/ow_pigman_xpfarm_mech.litematic'] },
	'Iron Farm Nether Side': { files: ['https://cdn.discordapp.com/attachments/647255354693910552/782357813343158332/Iron_Nether.litematic'] },
	'Ip' : {content: 'Mechanists is a **private whitelisted** server. Therefore the only way to join us is by submitting an application, if they are open.'}
};

export const command = {
	data: {
		name: 'faq',
		description: 'FAQ',
		options: [{ type: 'STRING', name: 'question', description: 'The question', choices: Object.keys(questions).map(name => ({ name, value: name })), required: true }]
	},
	async execute(interaction) {
		const question = interaction.options.getString('question');
		await interaction.reply(questions[question]);
	}
};
