const bookmark = require("../src/module/bookmark");
const util = require("util");
const md5 = require("md5");

bookmark.initialize(true, "remote");

const sourceId = "13";
const email = "rmercer33@gmail.com";
var userId = md5(email);;

bookmark.query(userId, sourceId)
  .then((list) => {
    console.log("query: ", list);
  })
  .catch((err) => {
    console.error(`queryerror: ${err}`);
  });

