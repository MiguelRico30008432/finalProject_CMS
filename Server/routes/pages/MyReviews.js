const express = require("express");
const router = express.Router();
const db = require("../../utility/database");
const auth = require("../../utility/verifications");
const log = require("../../logs/logsManagement");

router.post("/myReviews", auth.ensureAuthenticated, async (req, res) => {
  try {
    const result = await db.fetchDataCst(`
        SELECT
            assignmentid,
            submissionid,
            submissiontitle,
            to_char(submissionadddate, 'DD-MM-YYYY') AS submissionadddate,
            Concat(userfirstname, ' ', userlastname) AS username
        FROM ReviewsAssignments
        INNER JOIN submissions ON submissionid = assignmentsubmissionid
        INNER JOIN users ON submissionmainauthor = userid
        WHERE 
            assignmentuserid = ${req.body.userid}
        AND assignmentconfid = ${req.body.confid}
        `);

    return res.status(200).send(result);
  } catch (error) {
    log.addLog(error, "myReviews", "myReviews");
    return res.status(500);
  }
});

router.post("/singleReview", auth.ensureAuthenticated, async (req, res) => {
  try {
    const abstract = await db.fetchDataCst(`
      SELECT
        submissionabstract
      FROM ReviewsAssignments
      INNER JOIN submissions on submissionid = assignmentsubmissionid
      WHERE 
        assignmentid = ${req.body.assignmentid}
      `);

    const user = await db.fetchDataCst(`
      SELECT
         Concat(userfirstname, ' ', userlastname) AS username
      FROM users
      WHERE 
        userid = ${req.body.userid}
      `);

    const review = await db.fetchDataCst(`
      SELECT
        reviewtext,
        reviewgrade,
        to_char(reviewadddate, 'DD-MM-YYYY') AS reviewadddate,
        Concat(userfirstname, ' ', userlastname) AS username
      FROM reviews
      INNER JOIN ReviewsAssignments ON assignmentid = reviewassignmentid
      INNER JOIN submissions ON submissionid = assignmentsubmissionid
      INNER JOIN users ON assignmentuserid = users.userid
      WHERE 
          reviewassignmentid = ${req.body.assignmentid}
      AND assignmentuserid = ${req.body.userid}
      `);

    return res
      .status(200)
      .send({ username: user, abstract: abstract, review: review });
  } catch (error) {
    log.addLog(error, "endpoint", "singleReview");
    return res.status(500);
  }
});

router.post("/saveReview", auth.ensureAuthenticated, async (req, res) => {
  try {
    if (req.body.addNew) {
      await db.fetchDataCst(`
        INSERT INTO reviews (reviewassignmentid, reviewgrade, reviewtext)
        VALUES (${req.body.assignmentid}, ${req.body.reviewgrade}, '${req.body.reviewtext}')
        `);

      db.createEvent(
        req.body.confid,
        req.body.responsibleUser,
        `A new review has been submitted`
      );
    } else {
      await db.fetchDataCst(`
        UPDATE reviews SET
          reviewgrade = ${req.body.reviewgrade}, 
          reviewtext = '${req.body.reviewtext}'
        WHERE
          reviewassignmentid = ${req.body.assignmentid}
        `);

      db.createEvent(
        req.body.confid,
        req.body.responsibleUser,
        `A review has been updated`
      );
    }

    return res.status(200).send({ msg: "" });
  } catch (error) {
    log.addLog(error, "endpoint", "addReview");
    return res.status(500);
  }
});

router.post("/deleteReview", auth.ensureAuthenticated, async (req, res) => {
  try {
    await db.fetchDataCst(`
        DELETE FROM reviews WHERE reviewassignmentid = ${req.body.assignmentid}
      `);

    db.createEvent(
      req.body.confid,
      req.body.responsibleUser,
      `A review has been deleted`
    );

    return res.status(200).send({ msg: "" });
  } catch (error) {
    log.addLog(error, "endpoint", "addReview");
    return res.status(500);
  }
});

module.exports = router;
