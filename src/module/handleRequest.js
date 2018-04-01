
function parseRequest(request) {
  var parms = {message: []};

  //if no parms given set error indicator and return
  if (request.body === null || typeof request.body === "undefined") {
    parms.message.push("request body missing");
    parms.error = true;
    return parms;
  }

  var userRequest = request.body;

  //user email address
  if (!userRequest.userId) {
    parms.message.push("Error: body.userId missing");
  }
  else {
    parms.userId = userRequest.userId;
  }

  //bookmark Id (pageKey + paragraphKey)
  if (!userRequest.bookmarkId) {
    parms.message.push("Error: body.bookmarkId is required");
  }
  else {
    parms.bookmarkId = userRequest.bookmarkId;
  }

  //annotation
  if (!userRequest.annotation) {
    parms.message.push("Error: body.annotation is required");
  }
  else {
    parms.annotation = userRequest.annotation;
  }

  //annotationId
  if (!userRequest.annotationId) {
    parms.annotationId = null;
  }
  else {
    parms.annotationId = userRequest.annotationId;
  }

  return parms;
}

module.exports = {
  parse: parseRequest
};

