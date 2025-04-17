import crypto from 'crypto';

global.createdKeys = {
  firstKey: "stitch",
  endKey: "stitch_no_hacking_here"
};

global.generateToken = () => {
  return crypto.randomBytes(32).toString('hex'); 
};

global.generateCookies = () => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  return `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/`;
};

global.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

global.md5Reverse = (inputString) => {
  let md5Hash = crypto.createHash("md5").update(inputString, "utf-8").digest("hex");
  return md5Hash.split("").reverse().join("");
};

global.generateAPIKey = (ipOrString = "default") => {
  const randomNumbers = crypto.randomInt(10000, 99999);
  const randomHex = crypto.randomBytes(6).toString("hex");
  const encryptedKey = global.md5Reverse(ipOrString + randomHex + global.createdKeys.endKey);
  return `${global.createdKeys.firstKey}-${randomNumbers}-${encryptedKey}`;
};
