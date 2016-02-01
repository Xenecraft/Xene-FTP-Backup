XeneBackup
-----
Since our server was going through some occasional funky saving issues, I wanted to write another failsafe that would make sure that our players' work and world are being saved. This backup application is a node.js application written to make periodic backups of our Minecraft server from its FTP! It includes a cronjob that can run periodically based on the time that you set for it.

![Current Output](Backup Thing.png)

Setup
-----
1. `npm install`
2. Create your own settings.js at the root for the config of the FTP:
	```json
	var CONNECTION_SETTINGS = {
		host: 'ftpIP',
		user: 'userAccount',
		password: 'passWord',
		port: 21
	};

	var COPY_PATH = {
		folderName: 'yourFTPFolder',
		destinationPath: 'whereYourFilesGo'
	};

	var CRON_TIME = '00 00 3 * * 0-6';
	//this will run nightly at 3:00 AM every day

	module.exports = {CONNECTION_SETTINGS, COPY_PATH, CRON_TIME};

	```
3. `node connection` or `node cronjob`

ToDos:
-----
* Periodically delete other nights based on the frequency of backups
