
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex'); 
};

const generateCookies = () => {
    const sessionId = crypto.randomBytes(16).toString("hex");
    return `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/`;
};

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

const md5Reverse = (inputString) => {
    let md5Hash = crypto.createHash("md5").update(inputString, "utf-8").digest("hex");
    return md5Hash.split("").reverse().join("");
};

const generateAPIKey = (user) => {
    const randomNumbers = crypto.randomInt(10000, 99999);
    const randomHex = crypto.randomBytes(6).toString("hex");
    const encryptedKey = md5Reverse(user + randomHex + global.createdKeys.endKey);

    return `${global.createdKeys.firstKey}-${randomNumbers}-${encryptedKey}`;
};
