const express = require("express");
const router = express.Router();

const usersRouter = require("./users");
const logInLogoutRouter = require("./logInLogout");
const pendingConferences = require("./pages/PendingConferences");
const myProfile = require("./pages/MyProfile");
const myConferences = require("./pages/MyConferences");
const createConference = require("./pages/CreateConference");
const ConferenceContext = require("./conferenceContext");
const ComitteeManagementPage = require("./pages/ComiteManagement");
const emailsPage = require("./pages/EmailsPage");
const conferenceDefinitions = require("./pages/ConferenceDefinitions");
const sendInvitations = require("./pages/SendInvitations");

router.use(logInLogoutRouter);
router.use(emailsPage);
router.use(sendInvitations);
router.use(usersRouter);
router.use(pendingConferences);
router.use(myProfile);
router.use(myConferences);
router.use(createConference);
router.use(ConferenceContext);
router.use(ComitteeManagementPage);
router.use(conferenceDefinitions);

module.exports = router;
