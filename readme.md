XeneBackup
-----
Since our server was going through some occasional funky saving issues, I wanted to write another failsafe that would make sure that our players' work and world are being saved. This Backup thing is a node.js program written to make periodic backups of our Minecraft server from its FTP!

Setup
-----
1. npm install
2. Create your own settings.js and module.exports the config for the FTP.
3. node connection

ToDos:
-----
* Include a cronjob to make it nightly/weekly
* Periodically delete other nights based on the frequency of backups
* Modularize everything to its own file, cron, backup, copy, delete, etc.