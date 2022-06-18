import {client} from "../../index.js";

export const command = {
	data: {
		name: 'emojiservers',
		description: 'Lists the emoji servers',
		defaultPermission: false
	},
	async execute(interaction) {
		const guilds = client.guilds.cache.filter(guild => guild.name === 'Mech Emoji Server');
        const invites = [];
        for(const guild of guilds.values()) {
            const channel = guild.channels.cache.first();
            const invite = await channel.createInvite({maxAge: 0});
            invites.push(invite.url)
        }
        await interaction.reply(invites.join('\n'));
	}
};
