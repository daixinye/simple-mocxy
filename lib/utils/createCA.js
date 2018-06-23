const forge = require('node-forge');
const pki = forge.pki;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

var keys = pki.rsa.generateKeyPair(1024);
var cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = new Date().getTime() + '';

// 设置CA证书有效期
cert.validity.notBefore = new Date();
cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 5);
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 20);
var attrs = [
  {
    name: 'commonName',
    value: 'simple-mocxy'
  },
  {
    name: 'countryName',
    value: 'CN'
  },
  {
    shortName: 'ST',
    value: 'Zhejiang'
  },
  {
    name: 'localityName',
    value: 'Hangzhou'
  },
  {
    name: 'organizationName',
    value: 'Guapi'
  },
  {
    shortName: 'OU',
    value: 'http://daixinye.com/ssl'
  }
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  {
    name: 'basicConstraints',
    critical: true,
    cA: true
  },
  {
    name: 'keyUsage',
    critical: true,
    keyCertSign: true
  },
  {
    name: 'subjectKeyIdentifier'
  }
]);

// 用自己的私钥给CA根证书签名
cert.sign(keys.privateKey, forge.md.sha256.create());

// 公钥
var certPem = pki.certificateToPem(cert);
// 私钥
var keyPem = pki.privateKeyToPem(keys.privateKey);

try {
  fs.mkdirSync('./keys');
} catch (e) {
} finally {
  fs.writeFileSync(path.join(__dirname,'../../keys/rootCA.crt'), certPem)
  fs.writeFileSync(path.join(__dirname,'../../keys/rootCA.key.pem'), keyPem)
}
