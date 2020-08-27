/*
 * Removed mailgun credentials so this won't work anymore. It
 * has been replaced by cmi-user2
 */

module.exports = {
  initializeSend: function() {
    const mailgun = require("mailgun-js")(mailgunPrivateKey);
    return mailgun;
  },
  initializeVerify: function() {
    const mailgun = require("mailgun-js")(mailgunPublicKey);
    return mailgun;
  }
};

