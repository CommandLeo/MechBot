import { TextInputComponent, Modal, MessageActionRow } from 'discord.js';

const textInput = new TextInputComponent({ customId: 'reason', label: 'Reason', style: 'SHORT' });
const row = new MessageActionRow({ components: [textInput] });
const modal = new Modal({ customId: 'reason-modal', title: 'Provide a reason', components: [row] });

const userOptions = Array.from({ length: 24 }, (_, i) => ({ type: 'USER', name: `user-${i + 1}`, description: `User ${i + 1}`, required: i === 0 }));

export const command = {
	data: {
		name: 'denyapplication',
		description: 'Denies one or more applications',
		options: [...userOptions, { type: 'STRING', name: 'reason', description: 'The reason to deny the applications' }]
	},
	async execute(interaction) {
		const users = Array.from({ length: 24 }, (_, i) => interaction.options.getUser(`user-${i + 1}`)).filter(user?.bot == false);
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
