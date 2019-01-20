/*eslint no-console: "warn"*/

/*
 * Bookmmarks:
 *
 * A Bookmark is comprised of zero or more annotations and topics for a given
 * transcript paragraph.
 *
 * Bookmarks are keyed by pageKey + paragraph number. The pageKey uniquely identifies
 * a transcript and is comprised of Source, Book, Unit, and other identifiers. The
 * paragraph key is a fractional number ranging from 0.001 to 0.999 where 0.001 referenes
 * paragraph "#p0" of a transcript and 0.051 references "#p50".
 *
 * The pageKey is different for each source but the first two positions identify the source.
 * For WOM, keys start with 10.
 *
 * Bookmarks are stored by email address and paragraphId. Bookmarks can contain more than one
 * annotation. An annotation contains a comment, a list of topics, and a creationDate that is
 * used as a unique annotation identifier.
 *
 */
const AWS = require("aws-sdk");
const isEqual = require("lodash/isEqual");
const findIndex = require("lodash/findIndex");
const getKeyRange = require("./key");

let baseTableName = "bookmarks";
let dbInitialized = false;
let db;

function initDB(dev = false, endpoint = "local") {

  // --------- DEVELOPMENT ONLY ------------------
  if (dev) {
    var local = "http://localhost:8000";
    var remote = "https://dynamodb.us-east-1.amazonaws.com";

    var awsConfig = {
      region: "us-east-1"
    };

    if (endpoint === "remote") {
      awsConfig.endpoint = remote;
    }
    else {
      awsConfig.endpoint = local;
    }

    AWS.config.update(awsConfig);
  }
  // --------- DEVELOPMENT ONLY ------------------

  if (!dbInitialized) {
    db = new AWS.DynamoDB.DocumentClient();
    dbInitialized = true;
  }
}

/*
 * Bookmarks are stored in source specific tables. Table are named
 * "bookmarks<sourceId>". This function extracts the sourceId from
 * the bookmarkId (bid) and returns the table name.
 */
function getTableName(bid) {
  if (typeof bid !== "string") {
    bid = bid.toString();
  }

  return `${baseTableName}${bid.substr(0,2)}`;
}


/*
 * Create or update annotation
 *
 * If the eannotation has a creationDate then an update is requested.
 * Update the bookmark if not a duplicate.
 *
 * args:
 *  userId: email address
 *  bookmarkId: pageKey + paragraphKey
 *  annotation: An object containing 'Comment' and topicArray
 *  annotationId: Required for new annotation, not used for updates
 *    an Id to identify the annotation. It's assigned to the
 *    annotation.creationDate for new annotations
 *
 */
function putAnnotation(userId, bookmarkId, annotation, annotationId) {
  return new Promise((resolve, reject) => {
    let update = false;

    //get bookmark and see if it already has the new annotation
    getBookmark(userId, bookmarkId)
      .then((response) => {
        let bookmark = [];

        //we found a bookmark
        if (response.Item) {

          //check for modified annotation
          if (annotation.creationDate) {

            //convert to number
            if (typeof annotation.creationDate === "string") {
              annotation.creationDate = parseInt(annotation.creationDate, 10);
            }

            //we expect to find the original annotation in the bookmark
            let index = findIndex(response.Item.bookmark, a => a.creationDate === annotation.creationDate);
            if (index === -1) {
              reject(Error(`Update: Annotation not found: ${userId}/${bookmarkId}:${annotationId}`));
              return;
            }

            //return if the new annotation is the same as the original
            if (isEqual(response.Item.bookmark[index], annotation)) {
              resolve(`Duplicate annotation: ${userId}/${bookmarkId}:${annotation.creationDate}`);
              return;
            }
            else {
              //UPDATE: delete original annotation
              update = true;
              response.Item.bookmark.splice(index, 1);
            }
          }
          else {
            //INSERT: NEW Annotation for existing Bookmark

            //check for annotation with a creationDate == annotationId and reject
            //the new annotation if one is found because this is an attempt to insert
            //and not update
            if (findIndex(response.Item.bookmark, a => a.creationDate === annotationId) !== -1) {
              resolve(`AnnotationId is not unique: ${userId}/${bookmarkId}:${annotationId}`);
              return;
            }

            annotation.creationDate = annotationId;
          }

          bookmark = response.Item.bookmark;
        }
        else {
          //NEW Annotation nad NEW Bookmark
          annotation.creationDate = annotationId;
        }

        //ensure annotationId is not null
        if (!annotation.creationDate) {
          reject(Error("annotationId is required for new annotations"));
          return;
        }
        else if (typeof annotation.creationDate === "string") {
          annotation.creationDate = parseInt(annotation.creationDate, 10);
        }

        //add new or updated annotation to bookmark
        bookmark.push(annotation);

        //create or replace parms
        let putParams = {
          TableName: getTableName(bookmarkId),
          Item: {
            "userId": userId,
            "bookmarkId": bookmarkId,
            "bookmark": bookmark
          }
        };

        //console.log("calling db.put: userId: %s, bookmarkId: %s, bookmark: %o", userId, bookmarkId, bookmark);
        //let item = JSON.stringify(putParams);
        //console.log(item);

        db.put(putParams, function(err/*, data*/) {
          if (err) {
            console.log("db.put error: err: %o, params: %o", err, putParams);
            reject(err);
          }
          else {
            if (update) {
              resolve(`${annotation.creationDate} updated`);
            }
            else {
              resolve(`${annotation.creationDate} inserted`);
            }
          }
        });
      })
      .catch((err) => {
        console.log("getBookmark db error: %s", err);
        reject(err);
      });
  });
}

/*
 * Insert or replace bookmark
 */
function putBookmark(userId, bookmarkId, bookmark) {

  return new Promise((resolve, reject) => {

    let putParams = {
      TableName: getTableName(bookmarkId),
      Item: {
        "userId": userId,
        "bookmarkId": bookmarkId,
        "bookmark": bookmark
      }
    };

    db.put(putParams, function(err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

/*
 * Bookmarks have one or more annotations, This function
 * deletes the entire bookmark
 */
function deleteBookmark(userId, bookmarkId) {

  return new Promise((resolve, reject) => {
    if (typeof userId === "undefined" ||
        typeof bookmarkId === "undefined") {
      reject(`Undefined parameters: userId: ${userId}, bookmarkId: ${bookmarkId}`);
      return;
    }

    if (typeof bookmarkId === "string") {
      bookmarkId = parseFloat(bookmarkId);
    }

    //delete parms
    let deleteParams = {
      TableName: getTableName(bookmarkId),
      Key: {
        "userId": userId,
        "bookmarkId": bookmarkId
      }
    };

    db.delete(deleteParams, function(err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

/*
 * Deletes the specified annotation within a bookmark
 */
function deleteAnnotation(userId, bookmarkId, annotationId) {
  console.log("deleteAnnotation(%s,%s,%s)", userId, bookmarkId, annotationId);

  return new Promise((resolve, reject) => {
    if (typeof userId === "undefined" ||
        typeof bookmarkId === "undefined" ||
        typeof annotationId === "undefined") {
      reject(`Undefined parameters: userId: ${userId}, bookmarkId: ${bookmarkId}, annotationId: ${annotationId}`);
      return;
    }

    if (typeof bookmarkId === "string") {
      bookmarkId = parseFloat(bookmarkId);
    }

    //query the bookmark
    getBookmark(userId, bookmarkId)
      .then((response) => {
        //convert to number
        if (typeof annotationId === "string") {
          annotationId = parseInt(annotationId, 10);
        }

        //get the index of the annotation to delete
        let index = findIndex(response.Item.bookmark, a => a.creationDate === annotationId);
        if (index === -1) {
          reject(`annotation ${annotationId} does not exist`);
          return;
        }

        //delete annotation from bookmark
        response.Item.bookmark.splice(index, 1);

        putBookmark(userId, bookmarkId, response.Item.bookmark)
          .then((data) => {
            data.annotations = response.Item.bookmark.length;
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/*
 * query
 *
 * Get all bookmarks for the specified user and id.
 *
 * args:
 *  userId: md5 of email address
 *  key: can specify a complete or partial pageKey but must specify
 *      the sourceId at the minimum (2 digits)
 */
function query(userId, key) {
  return new Promise((resolve, reject) => {
    if (typeof key === "string") {
      key = parseFloat(key);
    }

    let keyRange = getKeyRange(key);

    //query parms
    let queryParams = {
      TableName: getTableName(key),
      KeyConditionExpression: "userId = :address and bookmarkId BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":address": userId,
        ":start": keyRange.startValue,
        ":end": keyRange.endValue
      }
    };

    //console.log("query: TableName:%s, userId:%s, start: %s, end: %s", queryParams.TableName, userId, keyRange.startValue, keyRange.endValue);

    db.query(queryParams, function(err, data) {
      if (err) {
        reject(err);
      }
      else {
        //remove userId from result
        let bookmarks = data.Items.map((b) => {
          return {id: b.bookmarkId, bookmark: b.bookmark};
        });

        //deleted bookmarks don't have data but they do exist as empty arrays
        // - they get filtered from the set
        let filtered = bookmarks.filter(b => b.bookmark.length > 0);
        resolve(filtered);
      }
    });
  });
}

/*
 * Get the specified bookmark
 */
function getBookmark(userId, bookmarkId) {
  return new Promise((resolve, reject) => {

    if (typeof bookmarkId === "string") {
      bookmarkId = parseFloat(bookmarkId);
    }

    //query parms
    let getParams = {
      TableName: getTableName(bookmarkId),
      Key: {
        "userId": userId,
        "bookmarkId": bookmarkId
      }
    };

    db.get(getParams, function(err, data) {
      if (err) {
        reject(err.message);
      }
      else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  initialize: function(dev, endpoint) {
    initDB(dev, endpoint);
  },
  putAnnotation: putAnnotation,
  deleteAnnotation: deleteAnnotation,
  getBookmark: getBookmark,
  deleteBookmark: deleteBookmark,
  query: query
};


