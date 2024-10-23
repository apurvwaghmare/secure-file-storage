const CryptoJS = require('crypto-js');
const fs = require('fs');

const encryptFile = (inputFile, outputFile, key) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(inputFile);
        let encryptedData = '';

        readStream.on('data', (chunk) => {
            const wordArray = CryptoJS.lib.WordArray.create(chunk);
            const encrypted = CryptoJS.Blowfish.encrypt(wordArray, key).toString();
            encryptedData += encrypted;
        });

        readStream.on('end', () => {
            fs.writeFile(outputFile, encryptedData, 'utf8', (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        readStream.on('error', reject);
    });
};

const decryptFile = (inputFile, outputFile, key) => {
    return new Promise((resolve, reject) => {
        fs.readFile(inputFile, 'utf8', (err, encryptedData) => {
            if (err) return reject(err);
            try {
                const decrypted = CryptoJS.Blowfish.decrypt(encryptedData, key);
                const binaryData = Buffer.from(decrypted.toString(CryptoJS.enc.Latin1), 'binary');
                fs.writeFile(outputFile, binaryData, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
};

const generateKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
};

module.exports = { encryptFile, decryptFile, generateKey };
