const CryptoJS = require('crypto-js');
const fs = require('fs');
const { Transform } = require('stream');

const encryptFile = (inputFile, outputFile, key) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(inputFile, { encoding: 'binary' });
        const writeStream = fs.createWriteStream(outputFile, { encoding: 'binary' });

        const transform = new Transform({
            transform(chunk, encoding, callback) {
                const wordArray = CryptoJS.lib.WordArray.create(Buffer.from(chunk, 'binary'));
                const encrypted = CryptoJS.Blowfish.encrypt(wordArray, key).toString();
                const base64Encrypted = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
                this.push(base64Encrypted + '\n');
                callback();
            }
        });

        readStream.pipe(transform).pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
    });
};

const decryptFile = (inputFile, outputFile, key) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(inputFile, { encoding: 'utf8' });
        const writeStream = fs.createWriteStream(outputFile, { encoding: 'binary' });

        let encryptedData = '';

        readStream.on('data', (chunk) => {
            encryptedData += chunk;
        });

        readStream.on('end', () => {
            try {
                const decodedData = CryptoJS.enc.Base64.parse(encryptedData.replace(/\n/g, ''));
                const decrypted = CryptoJS.Blowfish.decrypt(decodedData, key);
                const binaryData = Buffer.from(decrypted.toString(CryptoJS.enc.Latin1), 'binary');
                writeStream.write(binaryData);
                writeStream.end(() => resolve());
            } catch (error) {
                reject(error);
            }
        });

        readStream.on('error', reject);
        writeStream.on('error', reject);
    });
};

const generateKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
};

module.exports = { encryptFile, decryptFile, generateKey };
