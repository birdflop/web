const config = require('./config.json');

const fetchUser = async function fetchUser(id) {
    const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${config.TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    return await res.json();
}

exports.fetchUser = fetchUser;