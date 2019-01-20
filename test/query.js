const bookmark = require("../src/module/bookmark");
const util = require("util");

bookmark.initialize(true, "remote");

const userId = "05399539cca9ac38db6db36f5c770ff1";

bookmark.query(userId, "123")
  .then((list) => {
    console.log("query: ", list);
  })
  .catch((err) => {
    console.error(`queryerror: ${err}`);
  });

