const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function giveTempRole(member, role, duration, reason) {
	const TempRoles = member.client.sequelize.model('temproles');
	await member.roles.add(role, { reason });
	const endDate = Date.now() + duration;
	const temprole = await TempRoles.create({ memberId: member.id, roleId: role.id, endDate });

	wait(duration).then(() => removeTempRole(member, role, temprole));
}

async function removeTempRole(member, role, temprole) {
	await temprole.destroy();
	await member?.roles.remove(role);
	console.log(`[TEMP ROLE EXPIRED] Removed role ${role.name} from ${member.user.tag} (id: ${member.id}) as it expired`);
}

export async function checkTempRoles(client) {
	const guild = client.GUILD;

	const TempRoles = client.sequelize.model('temproles');
	const tempRoleList = await TempRoles.findAll();

	await Promise.all(
		tempRoleList.map(async temprole => {
			const { memberId, roleId, endDate } = temprole;
			const member = await guild.members.fetch(memberId);
			const role = await guild.roles.fetch(roleId);
			await wait(endDate - Date.now());
			await removeTempRole(member, role, temprole);
		})
	);
}
