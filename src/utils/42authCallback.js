const express = require('express');

    const app = express();
    const axios = require('axios');
    const db = require('./db');
    const { Client } = require('discord.js');

/**
 * 
 * @param {Client} readyClient 
 */
function init (readyClient) {
    const PORT = process.env.PORT || 3000;

    const REDIRECT_URI = process.env.AUTH_REDIRECT_URI;
    const ROUTE = REDIRECT_URI.match(new RegExp(/https?:\/\/[^\/]+(\/.*)/))[1] || '/';

    async function update_nickname(userid, guildid, nickname) {
        try {
            const guild = await readyClient.guilds.fetch(guildid);
            const member = await guild.members.fetch(userid);
            member.setNickname(nickname);
        } catch (err) {
            if (err.code === 50013) {
                console.warn('Missing permissions to update nickname');
                return;
            }
            console.error('Error updating nickname');
            console.error(err);
        }
    }

    app.get(ROUTE, async (req, res) => {
        const state = req.query.state;
        const code = req.query.code;

        const stateDoc = await db.getData('states', state);

        const params = {
            grant_type: "authorization_code",
            client_id: process.env.AUTH_UID,
            client_secret: process.env.AUTH_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI,
            state: state,
        }
        axios.post("https://api.intra.42.fr/oauth/token", params)
            .then(async (req) => {
                stateDoc.token = req.data;
                await db.writeData('states', state, stateDoc);
                res.send('You have logged in. You can close this window now.');

                if (process.env.UPDATE_NICKNAME_ON_LOGIN) {
                    axios.get("https://api.intra.42.fr/v2/me", {
                        headers: {
                            Authorization: `Bearer ${stateDoc.token.access_token}`,
                        },
                    }).then(async (req) => {
                        const login = req.data.login;
                        try {
                            await update_nickname(stateDoc.user, stateDoc.guild, login);
                        } catch (err) {
                            console.error('Error updating nickname');
                            console.error(err);
                        }
                    }).catch((err) => {
                        console.error('Error getting user data');
                        console.error(err);
                    });
                }
            })
            .catch((err) => {
                res.send('There was an error logging in. Please try again.');
                console.error('Error getting token');
                console.error(err);
            });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Redirect URI is set to ${REDIRECT_URI}`);
        console.log(`Route is set to ${ROUTE}`);
    });
}

module.exports = {
    init,
}