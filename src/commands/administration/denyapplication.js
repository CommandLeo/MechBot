import { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

const textInput = new TextInputBuilder({ customId: 'reason', label: 'Reason', style: TextInputStyle.Short });
const row = new ActionRowBuilder({ components: [textInput] });
const modal = new ModalBuilder({ customId: 'reason-modal', title: 'Provide a reason', components: [row] });

const userOptions = Array.from({ length: 24 }, (_, i) => ({ type: ApplicationCommandOptionType.User, name: `user-${i + 1}`, description: `User ${i + 1}`, required: i === 0 }));

export const command = {
	data: {
		name: 'denyapplication',
		description: 'Denies one or more applications',
		type: ApplicationCommandType.ChatInput,
		options: [...userOptions, { type: ApplicationCommandOptionType.String, name: 'reason', description: 'The reason to deny the applications' }]
	},
	async execute(interaction) {
		const users = Array.from({ length: 24 }, (_, i) => interaction.options.getUser(`user-${i + 1}`)).filter(user => user?.bot === false);
		let reason = interaction.options.getString('reason');

		if (!users.length) return await interaction.reply({ content: 'Invalid users!', ephemeral: true });

		if (!reason) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId === 'reason-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			reason = modalInteraction.fields.getTextInputValue('reason');
			interaction = modalInteraction;
		}

		const results = await Promise.allSettled(users.map(async user => await user.send(`Unfortunately your application for the Mechanists server hasn't been accepted${reason ? ':\n' + reason : ''}`)));

		await interaction.reply(`${results.filter(result => result.status === 'fulfilled').length}/${results.length} messages have been successfully sent`);
	}
};
