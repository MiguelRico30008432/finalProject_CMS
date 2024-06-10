const express = require("express");
const router = express.Router();
const db = require("../../utility/database");
const auth = require("../../utility/verifications");
const log = require("../../logs/logsManagement");

async function getCommitteeEmails(confid) {
  try {
    const committeeEmails = await db.fetchDataCst(`
    SELECT 
        ur.userrole,
        u.useremail,
        u.useraffiliation
      FROM 
        userroles ur
      JOIN 
        users u ON ur.userid = u.userid
      WHERE 
        ur.confid = ${confid}
      AND ur.userrole IN ('Chair', 'Owner', 'Committee')
    `);
    return committeeEmails;
  } catch (error) {
    log.addLog(error, "database", "Bidding -> getCommitteeEmails()");
  }
}

async function getSubmissions(confid) {
  try {
    const submissions = await db.fetchDataCst(`
    SELECT
      submissionid
    FROM
      submissions
    WHERE
      submissionconfid = ${confid}
    ORDER BY 
      submissionid
    `);

    return submissions;
  } catch (error) {
    log.addLog(error, "database", "Bidding -> getSubmissions()");
  }
}

async function getBiddings(confid) {
  try {
    const biddings = await db.fetchDataCst(`
    SELECT
      s.submissiontitle,
      u.useremail,
      b.biddingconfidence,
      b.biddingadddata
    FROM
      biddings b
    JOIN
      users u ON b.biddinguserid = u.userid
    JOIN
      submissions s ON b.biddingsubmissionid = s.submissionid
    WHERE
      b.biddingconfid = ${confid}
    ORDER BY
      b.biddingid
    `);

    return biddings;
  } catch (error) {
    log.addLog(error, "database", "Bidding -> getBiddings()");
  }
}

async function getAssignments(confid) {
  try {
    const assignments = await db.fetchDataCst(`
    SELECT
      r.assignmentid,
      r.assignmentsubmissionid,
      u.useremail,
      r.assignmentmanually
    FROM
      reviewsassignments r
    JOIN
      users u ON r.assignmentuserid = u.userid
    WHERE
      r.assignmentconfid = ${confid}
    ORDER BY
      r.assignmentid
    `);

    return assignments;
  } catch (error) {
    log.addLog(error, "database", "Reviews -> getAssignments()");
  }
}

async function getConflicts(confid) {
  try {
    const conflicts = await db.fetchDataCst(`
    SELECT
      conflictsubmissionid,
      conflictuseremail
    FROM
      conflicts
    WHERE
      conflictconfid = ${confid}
    ORDER BY 
      conflictsubmissionid
    `);

    return conflicts;
  } catch (error) {
    log.addLog(error, "database", "Bidding -> getConflicts()");
  }
}

async function getWorkload(confid) {
  try {
    const workload = await db.fetchDataCst(`
    SELECT 
      u.useremail,
      ur.userrole,
      COUNT(ra.assignmentid) AS assignment_count
    FROM 
      userroles ur
    JOIN 
      users u ON ur.userid = u.userid
    JOIN 
      reviewsassignments ra 
      ON ur.userid = ra.assignmentuserid
      AND ur.confid = ra.assignmentconfid
    WHERE 
      ur.confid = ${confid}
      AND ur.userrole IN ('Chair', 'Owner', 'Committee')
    GROUP BY 
      u.useremail,
      ur.userrole;
    `);

    return workload;
  } catch (error) {
    log.addLog(error, "database", "Bidding -> getWorkload()");
  }
}

async function verifyAssignmentsReviewers(confid) {} //EM FALTA

async function deleteAutomaticAssignments(assignmentsToDelete) {} // EM FALTA

async function pickPreferableAutomaticAssignments(
  automaticAssignments,
  workload,
  assignmentsNeeded
) {} //EM FALTA

async function ReviewsAssignmentAlghoritm(confid) {
  //get committe list
  const committeeEmails = await getCommitteeEmails(confid);

  //get submissions list
  const submissions = await getSubmissions(confid);

  //get biddings list
  const biddings = await getBiddings(confid);

  //get Assignments already defined
  const assignments = await getAssignments(confid);

  //get Conflicts list
  const conflicts = await getConflicts(confid);

  //get workload of each member in the committe
  const workload = await getWorkload(confid);

  //Average reviewers needed per submission (if its a decimal number, round down)
  const reviewersNeededPerReview = Math.floor(
    submissions.length / committeeEmails.length
  );

  //Variable used in the while loop (will be true when all submission have the minimun number of reviewers assigned)
  let MinReviews = false;

  while (MinReviews === false) {
    for (const submission of submissions) {
      //Create temporary list with committee members with no conflict with the current submission
      const submissionNoConflictCommittee = committeeEmails.filter((user) => {
        return !conflicts.some(
          (conflict) =>
            conflict.conflictsubmissionid === submission.submissionid &&
            conflict.conflictuseremail === user.useremail
        );
      });

      //Create temporary list with already defined assignments
      let submissionMadeAssignments = [];
      for (const assignment of assignments) {
        if (assignment.assignmentsubmissionid === submission.submissionid) {
          submissionMadeAssignments.push(assignment);
        }
      }

      //Separate manual assignments(cant be altered) from automatic assignments(can be altered)
      let manualAssignments = [];
      let automaticAssignments = [];
      if (submissionMadeAssignments.length > 0) {
        for (const madeAssignment of submissionMadeAssignments) {
          if (madeAssignment.assignmentmanually === true) {
            manualAssignments.push(madeAssignment);
          } else {
            automaticAssignments.push(madeAssignment);
          }
        }
      }
      //If theres enougth manual assignments, delete automatic assignments and skip to next submission
      if (manualAssignments.length >= reviewersNeededPerReview) {
        await deleteAutomaticAssignments(automaticAssignments);
        continue;
      }

      // If submissionMadeAssignments = reviewersNeededReview then we skip for next submission
      if (submissionMadeAssignments.length === reviewersNeededPerReview) {
        continue;
      }

      //If submissionMadeAssignments > reviewerNeededPerReview, then we need to choose witch automatica assignments stay
      if (submissionMadeAssignments.length > reviewersNeededPerReview) {
        //From the automatic assignments we choose the preferible ones having in count confidence level and workload of the committee members
        const automaticAssignmentsNeeded =
          reviewersNeededPerReview - manualAssignments.length;
        const choosenAutomaticAssignments =
          await pickPreferableAutomaticAssignments(
            automaticAssignments,
            workload,
            automaticAssignmentsNeeded
          );

        //Then we delete the assignments we do not use
        const unnacesseryAssignments = automaticAssignments.filter(
          (assignment) => {
            return !choosenAutomaticAssignments.some(
              (choosen) => choosen === assignment
            );
          }
        );

        await deleteAutomaticAssignments(unnacesseryAssignments);
      }

      //If theres not enougth submissionMadeAssignments then we need to check biddings
      if (submissionMadeAssignments.length < reviewersNeededPerReview) {
        //create temporary list with the submission biddings
        const submissionBiddings = biddings.filter(
          (bid) => bid.biddingsubmissionid === submission.submissionid
        );
        //If theres enougth biddings so that manual assignments + biddings = reviewersNeededPerReview, then we register the biddings as automatic assignments
        if (
          submissionMadeAssignments.length + submissionBiddings.length ===
          reviewersNeededPerReview
        ) {
          //Criar uma função para adicionar ao reviewsassignment e depois adicionar +1 no workload de quem esta associado a bid
        }

        if (
          submissionMadeAssignments.length + submissionBiddings.length >
          reviewersNeededPerReview
        ) {
          //Criar uma função que retorne quem, das biddings, fica com a review (Nivel De Confiança > Bidding Date  (Se calhar nesta função ja posso levar em conta o workload VER))
          //Chamar função para adicionar ao reviewsassignment e depois adicionar +1 no workload de quem esta associado a bid
        }

        if (
          submissionMadeAssignments.length + submissionBiddings.length <
          reviewersNeededPerReview
        ) {
          //Criar uma função que retorne quem tem menos workload e assim fica com a review (=Workload  escolher o que essta primeiro na lista)
          //Chamar função para adicionar ao reviewsassignment e depois adicionar +1 no workload de quem esta associado a bid
        }
      }
    }

    MinReviews = true; // retirar depois
  }

  //Function to verify if all submissions have the minimal number of reviewers
  //If true the loop will stop and the algorithm is completed
  //If false the loop will run again and assign reviewers to the missing submissions
  MinReviews = await verifyAssignmentsReviewers(confid);
  /*
--Verificar carga de trabalho de cada membro do comite: (Ver se consigo tratar disto logo no manualAssignments.length + submissionBiddings.length > reviewersNeededPerReview)
---Separar nº de assignments manuais (não alteráveis) e nº assignments automáticos (alteraveis)
---Por membro, se a diferença de carga laboral do mesmo e o membro com menos carga, existir uma diferença de (media de assignments por reviewer + metade da media) assignments:
---- Se for assignments manuais não mexe,
---- Se for assignments automaticos retirar ate chegar a uma diferença de (media de assignments por reviewer + metade da media) assignments em relação ao membro com menos carga
---- No final tenho de ter uma validação para passar isto true ou false devido aos assignments manuais (Desenvolver este ponto)

--Na questão de manual e automatic assignments tenho de ter em atenção que n estou a ter em conta os que foram criados pelo algoritmo
 */
}

router.post(
  "/reviewsAssignmentsAlgorithm",
  auth.ensureAuthenticated,
  async (req, res) => {
    try {
      await ReviewsAssignmentAlghoritm(req.body.confid);
      return res
        .status(200)
        .send({ msg: "Reviews Assignments have been Updated" });
    } catch (error) {
      console.log(error);
      log.addLog(error, "database", "Bidding -> /reviewsAssignmentsAlgorithm");
      return res
        .status(500)
        .send({ msg: "Error running reviews assignment algorithm" });
    }
  }
);

router.post(
  "/getSubmissionsForBidding",
  auth.ensureAuthenticated,
  async (req, res) => {
    try {
      const result = await db.fetchDataCst(`
    SELECT
      s.submissionid,
      s.submissiontitle
    FROM
      submissions s
    WHERE
      s.submissionconfid = ${req.body.confid}
      AND NOT EXISTS (
          SELECT 1
          FROM biddings b
          WHERE b.biddingsubmissionid = s.submissionid
            AND b.biddinguserid = ${req.body.userid}
      )
      AND NOT EXISTS (
          SELECT 1
          FROM conflicts c
          JOIN users u ON u.useremail = c.conflictuseremail
          WHERE c.conflictsubmissionid = s.submissionid
            AND u.userid = ${req.body.userid})
    `);
      return res.status(200).send(result);
    } catch (error) {
      log.addLog(error, "endpoint", "getSubmissionsForBidding");
      return res.status(500).send({ msg: "Internal Error" });
    }
  }
);

router.post("/saveBidding", auth.ensureAuthenticated, async (req, res) => {
  try {
    if (req.body.bids.length === 0) {
      return res.status(404).send({ msg: "No valid bids were submitted." });
    }

    for (const bid of req.body.bids) {
      await db.fetchDataCst(`
      INSERT INTO biddings (biddingconfid, biddingsubmissionid, biddinguserid, biddingconfidence)
        VALUES (${req.body.confid}, ${bid.submissionid}, ${req.body.userid}, ${bid.confidence})
      `);
    }
    return res.status(200).send({});
  } catch (error) {
    log.addLog(error, "endpoint", "getSubmissionsForBidding");
    return res.status(500).send({ msg: "Internal Error" });
  }
});

module.exports = router;
