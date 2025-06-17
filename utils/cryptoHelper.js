import dotenv from "dotenv";
dotenv.config();
const secretKey = process.env.CRYPTO_SECRET_KEY;

// export const encrypt = function (data) {
//   const cipherData = CryptoJS.AES.encrypt(data, secretKey).toString();
//   return cipherData;
// };

// export const decrypt = function (encryptedText) {
//   try {
//     const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
//     if (bytes.sigBytes > 0) {
//       const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
//       return decryptedData;
//     } else {
//       throw new Error("Decryption Failed");
//     }
//   } catch (error) {
//     throw new Error("Decryption Failed");
//   }
// };

import crypto from "crypto";

const algorithm = "aes-256-cbc";
const ivLength = 16;

// Encrypt
export const encrypt = function (text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return iv + encrypted data in base64
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Decrypt
export const decrypt = function (encryptedText) {
  const [ivHex, encryptedData] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedData, "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
