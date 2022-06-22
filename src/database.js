import {Sequelize} from "sequelize";

const sqlClient = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});

sqlClient.define('temproles', {memberId: Sequelize.STRING, roleId: Sequelize.STRING, endDate: Sequelize.INTEGER});

sqlClient.define('reminders', {
	message: Sequelize.STRING,
	endDate: Sequelize.INTEGER,
	date: Sequelize.INTEGER,
	memberId: Sequelize.STRING,
	channelId: Sequelize.STRING
});

sqlClient.define('deleted_messages', {
	messageId: Sequelize.STRING,
	messageContent: Sequelize.TEXT,
	attachments: Sequelize.JSON
});

sqlClient.define('polls', {
	pollId: Sequelize.STRING,
	channelId: Sequelize.STRING,
	question: Sequelize.STRING,
	options: Sequelize.JSON,
	votes: Sequelize.JSON
});

export {sqlClient}