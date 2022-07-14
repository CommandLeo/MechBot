import got from 'got';
import { Formatters, MessageEmbed } from 'discord.js';
import { client, config, MECHANIST_DATA } from '../../index.js';
import { MECHANIST_PATH, writeJson } from '../../io.js';

export const command = {
	data: {
		name: 'memberlist',
		description: 'Updates the member list'
	},
	async execute(interaction) {
		const memberList = await got(MECHANIST_DATA.memberListUrl).json();
		const emojiManager = client.emojis;
		const infoChannel = client.CHANNELS.INFO;

		await interaction.deferReply({ ephemeral: true });

		const mechEmoji = emojiManager?.cache.find(emoji => emoji.name === 'mechanistsSpin');
		const memberData = Object.entries(memberList).map(([memberName, { youtube, twitch, twitter, github }], i) => {
			const escapedName = memberName.replace(/\s+/gi, '');
			const emoji = emojiManager?.cache.find(emoji => emoji.name === escapedName && emoji.guild.name === 'Mech Emoji Server');
			const name = `${emoji || ''} ${memberName}`;
			const socials = [
				youtube && Formatters.hyperlink('Youtube', `https://www.youtube.com/${youtube}`),
				twitch && Formatters.hyperlink('Twitch', `https://www.twitch.tv/${twitch}`),
				twitter && Formatters.hyperlink('Twitter', `https://twitter.com/${twitter}`),
				github && Formatters.hyperlink('Github', `https://github.com/${github}`)
			];
			const value = socials.filter(Boolean).join(' | ') || '---';
			return { name, value, inline: true };
		});
		memberData.push(...Array.from({ length: memberData.length % 3 === 0 ? 0 : 3 - (memberData.length % 3) }, () => ({ name: '᠎', value: '᠎', inline: true })));
		const embedsAmount = Math.ceil(memberData.length / 24);
		const elementsAmount = Math.ceil(memberData.length / embedsAmount / 3) * 3;
		const chunks = Array.from({ length: Math.min(10, embedsAmount) }, (_, i) => memberData.slice(elementsAmount * i, elementsAmount * (i + 1)));
		const embeds = chunks.map((fields, i) => {
			fields.forEach((field, i) => {
				if (i % 3 !== 2) field.name += '    𝅺';
			});
			const embed = new MessageEmbed({ color: '#3498db', fields });
			if (i === 0) embed.setTitle(`${mechEmoji} Mechanists Members`);
			return embed;
		});

		if (config['socials-message-id']) {
			const socialsMessageId = config['socials-message-id'] || '';
			const message = await infoChannel.messages.fetch(socialsMessageId).catch(() => null);
			if (message) {
				await message.edit({ embeds });
				return interaction.editReply({ content: 'Member list successfully updated', ephemeral: true });
			}
		}
		const message = await infoChannel.send({ embeds });
		writeJson(MECHANIST_PATH, JSON.stringify({ ...MECHANIST_DATA, socialsMessageId: message.id }, null, '	'));
		await interaction.editReply('Member list successfully sent');
	}
};
