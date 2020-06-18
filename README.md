# role-discord-bot

```bash
npx sequelize-cli model:generate --name Creating --attributes manageId:integer,roleNames:text
npx sequelize-cli model:generate --name Roles --attributes roleId:text,roleName:text,hexColor:text,createdTimestamp:integer,guildId:text,manageId:integer
npx sequelize-cli model:generate --name Messages --attributes messageId:text,guildId:text,manageId:integer
npx sequelize-cli db:migrate
```
