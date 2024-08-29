const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'userdatas.json');

async function readUserDatas() {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading user data:', error);
        throw error;
    }
}

async function writeUserDatas(userDatas) {
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(userDatas, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing user data:', error);
        throw error;
    }
}

module.exports = { readUserDatas, writeUserDatas };
