const router = require("express").Router();
const { mySQLClient, sql } = require("../lib/database/client.js");

router.get("/:id", async (req, res, next) => {
  var id = req.params.id;

  Promise.all([
    mySQLClient.executeQuery(await sql("SELECT_SHOP_DETAIL_BY_ID"), [id]),
  ])
    .then((results) => {
      var data = results[0][0];
      res.render("./shops/index.ejs", data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
