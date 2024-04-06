const express = require("express");
const db = require("../utility/database");
const router = express.Router();

router.get("/pendingConferences", async function (req, res) {
  try {
    const result = await db.fetchData("conferences", "confapproved", 0);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send("Internal Error");
  }
});

module.exports = router;