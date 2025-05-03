import crypto from 'crypto';


global.users_db = {
  owner: global.github.owner,
  repo: global.github.repo,
  path: global.github.database,
  token: global.github.token,
  branch: global.github.branch || 'main',

  headers: function () {
    return {
      Authorization: `Bearer ${this.token}`,  // استخدام this بدلاً من global.users_db.token
      Accept: 'application/vnd.github+json'
    };
  },

  sha: async function () {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}?ref=${this.branch}`;
    const res = await axios.get(url, { headers: this.headers() });
    return res.data.sha;
  },

  getData: async function () {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}?ref=${this.branch}`;
    const res = await axios.get(url, { headers: this.headers() });
    const content = Buffer.from(res.data.content, 'base64').toString();
    return JSON.parse(content);
  },

  updateData: async function (users, commitMessage = 'update') {
    const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
    const sha = await this.sha();

    const res = await axios.put(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}`,
      {
        message: commitMessage,
        content,
        sha,
        branch: this.branch
      },
      { headers: this.headers() }
    );

    return res.data;
  },

  getUsers: async function () {
    const users = await this.getData();
    return users;
  },
};




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




