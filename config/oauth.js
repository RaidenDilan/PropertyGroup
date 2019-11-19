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
  // facebook: {
  //   loginURL: 'https://www.facebook.com/v2.8/dialog/oauth',
  //   accessTokenURL: 'https://graph.facebook.com/v2.8/oauth/access_token',
  //   profileURL: '#',
  //   clientId: process.env.FB_GUNIT_ID,
  //   clientSecret: process.env.FB_GUNIT_SECRET,
  //   scope: 'user:email'
  // }
};
