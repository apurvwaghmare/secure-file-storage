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
                this.push(encrypted);
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
        fs.readFile(inputFile, { encoding: 'binary' }, (err, encryptedData) => {
            if (err) return reject(err);
            try {
                const decrypted = CryptoJS.Blowfish.decrypt(encryptedData, key);
                const binaryData = Buffer.from(decrypted.toString(CryptoJS.enc.Latin1), 'binary');
                fs.writeFile(outputFile, binaryData, { encoding: 'binary' }, (err) => {
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
