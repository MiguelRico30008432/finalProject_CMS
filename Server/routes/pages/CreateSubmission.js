const express = require("express");
const router = express.Router();
const db = require("../../utility/database");
const auth = require("../../utility/verifications");
const log = require("../../logs/logsManagement");
const sb = require("../../utility/supabase");
const fileUpload = require("express-fileupload");

router.use(fileUpload());

router.post("/createSubmission", auth.ensureAuthenticated, async (req, res) => {
  try {
    const authors = [];
    let index = 0;

    if (!req.files) {
      return res.status(400).send({ msg: "File Not Received" });
    }

    //insert submission
    await db.fetchDataCst(
      `INSERT INTO submissions (submissionconfID, submissionMainAuthor, submissiontitle, submissionabstract) VALUES (${req.body.confID}, ${req.body.userid}, '${req.body.title}', '${req.body.abstract}')`
    );

    const submissionid = await db.fetchDataCst(
      `SELECT MAX(submissionid) FROM submissions WHERE submissionconfid = '${req.body.confID}' AND submissionmainauthor = ${req.body.userid}`
    );

    //insert authors
    while (req.body[`author[${index}][firstName]`]) {
      authors.push({
        firstName: req.body[`author[${index}][firstName]`],
        lastName: req.body[`author[${index}][lastName]`],
        email: req.body[`author[${index}][email]`],
        affiliation: req.body[`author[${index}][affiliation]`],
      });
      index++;
    }

    authors.forEach(async (author) => {
      const firstName = author.firstName;
      const lastName = author.lastName;
      const email = author.email;
      const affiliation = author.affiliation;

      const userRegistered = await db.fetchData("users", "useremail", email);

      if (!userRegistered || userRegistered.length === 0) {
        await db.fetchDataCst(
          `INSERT INTO authors (authorAffiliation, authorEmail, authorFirstName, authorLastName, submissionID, userid) 
            VALUES ('${affiliation}', '${email}', '${firstName}', '${lastName}', ${submissionid[0].max}, null)`
        );
      } else {
        await db.fetchDataCst(
          `INSERT INTO authors (authorAffiliation, authorEmail, authorFirstName, authorLastName, submissionID, userid) 
            VALUES ('${userRegistered[0].useraffiliation}', '${userRegistered[0].useremail}', '${userRegistered[0].userfirstname}', '${userRegistered[0].userlastname}', ${submissionid[0].max}, ${userRegistered[0].userid})`
        );
      }
    });

    //insert file
    const file = req.files.file;

    await sb.addSubmissionFiles(
      file,
      req.body.confID,
      submissionid[0].max,
      req.body.userid
    );

    return res.status(200).send({ msg: "Submission Created." });
  } catch (error) {
    log.addLog(error, "database", "CreateSubmissions -> /createSubmission");
    return res.status(500).send({ msg: error });
  }
});

router.post("/getAuthorData", auth.ensureAuthenticated, async (req, res) => {
  try {
    const userRecords = await db.fetchData("users", "userid", req.body.userID);
    return res.status(200).send(userRecords);
  } catch (error) {
    log.addLog(error, "database", "CreateSubmissions -> /getAuthorData");
    return res.status(500);
  }
});

//router.post("/downloadFile", auth.ensureAuthenticated, async (req, res) => {
//  try {
//    const fileId = req.body.fileid;
//
//    const query = `SELECT fileName, file FROM files WHERE fileid = ${fileId}`;
//    const result = await db.fetchDataCst(query);
//
//    const fileData = result[0];
//
//    // Define o cabeçalho Content-Disposition para definir o nome do arquivo no download
//    res.setHeader(
//      "Content-Disposition",
//      `attachment; filename=${fileData.fileName}`
//    );
//
//    // Define o tipo de conteúdo para forçar o download
//
//    res.setHeader("Content-Type", "application/octet-stream");
//
//    // Envie os dados do arquivo como resposta
//    res.send(Buffer.from(fileData.file, "base64"));
//  } catch (error) {
//    console.error(error);
//    return res.status(500).send({ msg: "Internal Error" });
//  }
//});

module.exports = router;
