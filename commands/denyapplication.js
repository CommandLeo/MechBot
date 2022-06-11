import { TextInputComponent, Modal, MessageActionRow } from 'discord.js';

const textInput = new TextInputComponent({ customId: 'reason', label: 'Reason', style: 'SHORT' });
const row = new MessageActionRow({ components: [textInput] });
const modal = new Modal({ customId: 'reason-modal', title: 'Provide a reason', components: [row] });

export const command = {
	data: {
		name: 'denyapplication',
		description: 'Denies an application',
		defaultPermission: false,
		options: [
			{ type: 'USER', name: 'member', description: 'The member', required: true },
			{ type: 'STRING', name: 'reason', description: 'The reason', required: false }
		]
	},
	async execute(interaction) {
		const member = interaction.options.getMember('member');
		let reason = interaction.options.getString('reason');

		if (member.user.bot) return interaction.reply({ content: "Can't send the message to a bot", ephemeral: true });

		if (!reason) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId == 'reason-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			reason = modalInteraction.fields.getTextInputValue('reason');
			interaction = modalInteraction;
		}

		const message = await member.send(`Unfortunately your application for the Mechanists server hasn't been accepted${reason ? ':\n' + reason : ''}`).catch(() => null);
		await interaction.reply(message ? 'Message sent' : "Couldn't send the message");
	}
};
