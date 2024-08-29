// embedhook.js

const https = require('https');

/**
 * Send an embed message to a Discord webhook.
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {Object} embed - The embed object to send.
 * @returns {Promise<Object>} - A promise that resolves with the response from the webhook.
 */
function sendEmbed(webhookUrl, embed) {
    return new Promise((resolve, reject) => {
        const url = new URL(webhookUrl);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify({ embeds: [embed] }))
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        if (data) {
                            resolve(JSON.parse(data));
                        } else {
                            resolve({ message: 'No content returned' });
                        }
                    } else {
                        console.error(`HTTP status code: ${res.statusCode}, Response: ${data}`);
                        reject(new Error(`HTTP status code: ${res.statusCode}, Response: ${data}`));
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(JSON.stringify({ embeds: [embed] }));
        req.end();
    });
}

module.exports = sendEmbed;
