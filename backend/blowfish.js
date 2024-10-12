const CryptoJS = require('crypto-js');
const fs = require('fs');

const encryptFile = (inputFile, outputFile, key) => {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFile, (err, data) => {
      if (err) return reject(err);

      const encrypted = CryptoJS.Blowfish.encrypt(data.toString('binary'), key).toString();

      fs.writeFile(outputFile, encrypted, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const decryptFile = (inputFile, outputFile, key) => {
  return new Promise((resolve, reject) => {
      fs.readFile(inputFile, (err, data) => {
          if (err) return reject(err);
          try {
              const decrypted = CryptoJS.Blowfish.decrypt(data.toString(), key).toString(CryptoJS.enc.Utf8);
              fs.writeFile(outputFile, decrypted, { encoding: 'binary' }, (err) => {
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
