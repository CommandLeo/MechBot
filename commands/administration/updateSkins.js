import fs from 'fs/promises';
import got from 'got';

const config = JSON.parse(await fs.readFile('./config.json'));

async function createEmojiSkin(guild, [member, { ign }]) {
	const escapedName = member.replace(/\s+/gi, '');
	await guild.emojis.create(`https://minotar.net/helm/${ign}`, escapedName);
	console.log(`Created skin emoji for ${member}`);
}

export const command = {
	data: {
		name: 'updateskins',
		description: 'Updates the skins',
		defaultPermission: false,
		options: [{ type: 'USER', name: 'member', description: 'The member to whom to update the skin', required: false }]
	},
	async execute(interaction) {
		const member = interaction.options.getUser('member');
		await interaction.deferReply();

		const memberList = await got(config.memberListUrl).json();

		if (member) {
			const data = Object.entries(memberList).find(([, { discord }]) => discord == member.id);
			if (data) {
				const [memberName] = data;
				console.log(`Updating skin for ${memberName}...`);
				const escapedName = memberName.replace(/\s+/gi, '');
				const emoji = interaction.client.emojis.cache.find(emoji => emoji.name == escapedName && emoji.guild.name == 'Mech Emoji Server');
				if (emoji?.deletable) emoji.delete();
				const guild = interaction.client.guilds.cache.find(guild => guild.name == 'Mech Emoji Server' && guild.emojis.cache.size < 50);
				await createEmojiSkin(guild, data);
				console.log(`Updated skin for ${memberName}`);
				await interaction.editReply(`Updated skin for ${memberName}`);
			} else {
				return await interaction.editReply('Member not found');
			}
		} else {
			console.log('Updating skins...');
			const memberData = Object.entries(memberList);
			const guilds = interaction.client.guilds.cache.filter(guild => guild.name == 'Mech Emoji Server').toJSON();

			const deletionPromises = guilds?.flatMap(guild => guild?.emojis.cache.map(emoji => emoji.delete()));
			await Promise.all(deletionPromises);
			console.log('Deleted all existing skin emojis');

			const guildAmount = Math.ceil(memberData.length / 50) - guilds.length;
			for (let i = 0; i < guildAmount; i++) {
				guilds.push(await interaction.client.guilds.create('Mech Emoji Server', { channels: [{ name: 'general' }] }));
				console.log('Created a new emoji guild');
			}

			const updateSkinPromises = memberData.map((data, i) => createEmojiSkin(guilds[Math.floor(i / 50)], data));
			await Promise.all(updateSkinPromises);
			console.log('Finished updating skins');
			await interaction.editReply('Updated skins');
		}
	}
};
