// sendhook.js

const https = require('https');

/**
 * Send a message to a Discord webhook.
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {Object} messageContent - The content of the message, must be a valid JSON object.
 * @returns {Promise<Object>} - A promise that resolves with the response from the webhook.
 */
function sendhook(webhookUrl, messageContent) {
    return new Promise((resolve, reject) => {
        const url = new URL(webhookUrl);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(messageContent))
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
                        // Parse JSON if response is not empty
                        if (data) {
                            resolve(JSON.parse(data));
                        } else {
                            resolve({ message: 'No content returned' });
                        }
                    } else {
                        // Log full response for debugging
                        console.error(`HTTP status code: ${res.statusCode}, Response: ${data}`);
                        reject(new Error(`HTTP status code: ${res.statusCode}, Response: ${data}`));
                    }
                } catch (e) {
                    // Log parsing error
                    console.error('Error parsing JSON:', e);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(JSON.stringify(messageContent));
        req.end();
    });
}

module.exports = sendhook;
