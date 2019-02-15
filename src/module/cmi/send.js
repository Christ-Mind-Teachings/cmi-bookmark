/*eslint no-console: "warn"*/

const mg = require("./mailgun");
const template = require("./template.js");

const send = mg.initializeSend();
const verify = mg.initializeVerify();

var shareBody = {};

function verifyList(parms) {
  let emailList = parms.to.split(",");

  return new Promise((resolve, reject) => {
    verify.parse(emailList, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function shareQuote(parms) {
  shareBody.from = `${parms.senderName} <${parms.senderEmail}>`;
  shareBody.to = parms.to;
  shareBody.subject = `${parms.senderName} shared a quote from the Library of Christ Mind Teachings`;
  shareBody.html = template.generateEmail(parms.quote, parms.citation, parms.url);

  return new Promise((resolve, reject) => {
    send.messages().send(shareBody, (error, body) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(body);
    });
  });
}

module.exports = {
  share: shareQuote,
  verify: verifyList
};

