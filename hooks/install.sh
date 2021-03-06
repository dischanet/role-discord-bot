#!/bin/bash

cd /home/ec2-user/repos/role-discord-bot
npm install --production
npm run build

REGION=$(curl -s 169.254.169.254/latest/meta-data/local-hostname | cut -d '.' -f2)
PARAMETER_NAME=ROLE_DISCORD_BOT_SECRET
echo "DISCORD_BOT_TOKEN=$(/usr/bin/aws --region ${REGION} ssm get-parameter --name ${PARAMETER_NAME} --query "Parameter.Value" --output text)" > environment

sudo cp ./hooks/role-discord-bot.service /etc/systemd/system/role-discord-bot.service
sudo /usr/bin/systemctl enable role-discord-bot