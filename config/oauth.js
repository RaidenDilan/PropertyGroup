module.exports = {
  github: {
    loginURL: 'https://github.com/login/oauth/authorize',
    accessTokenURL: 'https://github.com/login/oauth/access_token',
    profileURL: 'https://api.github.com/user',
    clientId: process.env.PR3_GITHUB_CLIENT_ID,
    clientSecret: process.env.PR3_GITHUB_CLIENT_SECRET,
    scope: 'user:email',
    getLoginUrl() {
      return `${this.loginURL}?client_id=${this.clientId}&scope=${this.scope}`;
    }
  }
};
