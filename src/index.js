/*eslint no-console: "warn"*/

var ApiBuilder = require("claudia-api-builder");
var api = new ApiBuilder();
var db = require("./module/bookmark");

module.exports = api;

api.post("/request", function(request) {
  return request;
});

//share a bookmark via email
api.post("/share", function(request) {
  var send = require("./module/cmi/send");
  var userrequest = require("./module/cmi/request");

  var parms = userrequest.parseForSend(request);
  if (parms.error) {
    return parms;
  }

  return send.share(parms);
});

//share a bookmark via email
api.post("/verify", function(request) {
  var send = require("./module/cmi/send");
  var userrequest = require("./module/cmi/request");

  var parms = userrequest.parseForVerify(request);
  if (parms.error) {
    return parms;
  }

  return send.verify(parms);
});

//request full ACOL access
api.post("/acol/access", function(request) {
  var send = require("./module/cmi/send");
  var userrequest = require("./module/cmi/request");

  var parms = userrequest.parseForAccess(request);
  if (parms.error) {
    return parms;
  }

  return send.accessRequest(parms);
});

//create or update bookmark
api.post("/bookmark/annotation", function(request) {
  var handleRequest = require("./module/handleRequest");

  var parms = handleRequest.parse(request);

  var result = {
    message: "OK"
  };

  if (parms.error) {
    result.message = parms.message;
    return result;
  }

  db.initialize(false);

  return db.putAnnotation(parms.userId, parms.bookmarkId, parms.annotation, parms.annotationId)
    .then((response) => {
      result.response = response;
      return result;
    })
    .catch((err) => {
      result.message = err.message;
      return result;
    });
});

//delete annotation
api.delete("/bookmark/annotation/{uid}/{bid}/{aid}", function(request) {
  var db = require("./module/bookmark");

  let userId = request.pathParams.uid;
  let bookmarkId = request.pathParams.bid;
  let annotationId = request.pathParams.aid;

  var result = {
    message: "OK"
  };

  db.initialize(false);

  return db.deleteAnnotation(userId, bookmarkId, annotationId)
    .then((response) => {
      result.response = response;
      return result;
    })
    .catch((err) => {
      result.message = err.message;
      return result;
    });
});

//delete bookmark
api.delete("/bookmark/{uid}/{bid}", function(request) {
  var db = require("./module/bookmark");

  let userId = request.pathParams.uid;
  let bookmarkId = request.pathParams.bid;

  var result = {
    message: "OK"
  };

  db.initialize(false);

  return db.deleteBookmark(userId, bookmarkId)
    .then((response) => {
      result.response = response;
      return result;
    })
    .catch((err) => {
      result.message = err.message;
      return result;
    });
});

//get bookmark with bid for user with uid
api.get("/bookmark/{uid}/{bid}", function(request) {
  let userId = request.pathParams.uid;
  let bookmarkId = request.pathParams.bid;

  var result = {
    message: "OK"
  };

  db.initialize(false);

  return db.getBookmark(userId, bookmarkId)
    .then((response) => {
      result.response = response;
      return result;
    })
    .catch((err) => {
      result.message = err.message;
      return result;
    });
});

/*
 * query bookmarks for complete or partial pageKey. This can query
 * bookmarks by page, book, or source
 */
api.get("/bookmark/query/{uid}/{key}", function(request) {
  let userId = request.pathParams.uid;
  let queryKey = request.pathParams.key;

  var result = {
    message: "OK"
  };

  db.initialize(false);

  return db.query(userId, queryKey)
    .then((response) => {
      result.response = response;
      return result;
    })
    .catch((err) => {
      result.message = err.message;
      return result;
    });
});


