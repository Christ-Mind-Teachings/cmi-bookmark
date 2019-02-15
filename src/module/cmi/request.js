/*
 * Request body:
 * {
 *   from: "email address",
 *     to: "comma separated list of email addresses"
 * }
 */
function parseRequestForSend(request) {
  var parms = {message: []};

  parms.error = false;

  //if no parms given set error indicator and return
  if (request.body === null || typeof request.body === "undefined") {
    parms.message.push("request body missing");
    parms.error = true;
    return parms;
  }

  var userRequest = request.body;

  if (!userRequest.senderName) {
    parms.message.push("Error: 'senderName' not specified");
  }
  else {
    parms.senderName = userRequest.senderName;
  }

  if (!userRequest.senderEmail) {
    parms.message.push("Error: 'senderEmail' not specified");
  }
  else {
    parms.senderEmail = userRequest.senderEmail;
  }

  if (!userRequest.to) {
    parms.message.push("Error: 'to' not specified");
  }
  else {
    parms.to = userRequest.to;
  }

  if (!userRequest.quote) {
    parms.message.push("Error: 'quote' not specified");
  }
  else {
    parms.quote = userRequest.quote;
  }

  if (!userRequest.citation) {
    parms.message.push("Error: 'citation' not specified");
  }
  else {
    parms.citation = userRequest.citation;
  }

  if (!userRequest.url) {
    parms.message.push("Error: 'url' not specified");
  }
  else {
    parms.url = userRequest.url;
  }

  if (parms.message.length > 0) {
    parms.error = true;
  }

  return parms;
}

function parseForVerify(request) {
  var parms = {message: []};

  parms.error = false;

  //if no parms given set error indicator and return
  if (request.body === null || typeof request.body === "undefined") {
    parms.message.push("request body missing");
    parms.error = true;
    return parms;
  }

  var userRequest = request.body;

  if (!userRequest.to) {
    parms.message.push("Error: 'to' not specified");
  }
  else {
    parms.to = userRequest.to;
  }

  if (parms.message.length > 0) {
    parms.error = true;
  }

  return parms;
}

module.exports = {
  parseForSend: parseRequestForSend,
  parseForVerify: parseForVerify
};

