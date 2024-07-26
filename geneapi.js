const crypto = require('crypto');

function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

const apiKey = generateApiKey();
console.log('Generated API Key:', apiKey); // Print the key and store it securely
