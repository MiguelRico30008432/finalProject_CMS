const express = require("express");
const router = express.Router();
const db = require("../utility/database");
const auth = require("../utility/verifications");

router.post("/confContext", auth.ensureAuthenticated, async (req, res) => {
  try {
    const query = `
    SELECT 
        usercurrentconfid,
        STRING_AGG(userrole, ', ') AS userrole
    FROM users
    INNER JOIN conferences ON conferences.confid = users.usercurrentconfid
    INNER JOIN userRoles ON userRoles.confid = conferences.confid AND userRoles.userid = users.userid 
    WHERE users.userid = ${req.body.userid}
    GROUP BY usercurrentconfid`;

    const result = await db.queryCst(query);

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ msg: "Internal Error" });
  }
});

router.post(
  "/updateConfContext",
  auth.ensureAuthenticated,
  async (req, res) => {
    try {
      const queryText = `
      UPDATE users SET
        usercurrentconfid = ${req.body.confid}
      WHERE
        userid = ${req.body.userid}`;

      await db.queryCst(queryText);
      return res.status(200).send({ msg: "" });
    } catch (error) {
      return res.status(500).send({ msg: "Internal Error" });
    }
  }
);

module.exports = router;
