import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ConfNavbar from "../../OurComponents/navBars/ConferenceNavBar";
import { ConferenceContext } from "conference.context";
import { AuthContext } from "auth.context";
import * as React from "react";
import { useEffect, useState, useContext } from "react";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LoadingCircle from "OurComponents/loading/LoadingCircle";


export default function DefinitionsPage() {
  const { confID } = useContext(ConferenceContext);
  const { isLoggedIn } = useContext(AuthContext);

  const [openLoading, setOpenLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editModeActive, setEditModeActive] = useState(false);

  //original value
  const [name, setName] = useState("");
  const [webpage, setWebpage] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [submissionsStart, setSubmissionStart] = useState("");
  const [submissionsEnd, setSubmissionEnd] = useState("");
  const [biddingStart, setBiddingStart] = useState("");
  const [biddingEnd, setBiddingEnd] = useState("");
  const [reviewStart, setReviewStart] = useState("");
  const [reviewEnd, setReviewEnd] = useState("");
  const [confStart, setConfStart] = useState("");
  const [confEnd, setConfEnd] = useState("");
  const [minReviewers, setMinReviewers] = useState("");
  const [maxReviewers, setMaxReviewers] = useState("");
  const [submissionUpdate, setSubmissionUpdate] = useState("");

  //new values
  const [newName, setNewName] = useState("");
  const [newWebpage, setNewWebpage] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newSubmissionsStart, setNewSubmissionStart] = useState("");
  const [newSubmissionsEnd, setNewSubmissionEnd] = useState("");
  const [newBiddingStart, setNewBiddingStart] = useState("");
  const [newBiddingEnd, setNewBiddingEnd] = useState("");
  const [newReviewStart, setNewReviewStart] = useState("");
  const [newReviewEnd, setNewReviewEnd] = useState("");
  const [newConfStart, setNewConfStart] = useState("");
  const [newConfEnd, setNewConfEnd] = useState("");
  const [newMinReviewers, setNewMinReviewers] = useState("");
  const [newMaxReviewers, setNewMaxReviewers] = useState("");
  const [newSubmissionUpdate, setNewSubmissionUpdate] = useState("");

  useEffect(() => {
    async function getConfData() {
      setOpenLoading(true);
      try {
        const response = await fetch("http://localhost:8003/confDefinitions", {
          method: "POST",
          body: JSON.stringify({ confid: confID}),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          credentials: "include",
        });

        const jsonResponse = await response.json();

        if (response.status === 200) {
          setName(jsonResponse[0].confname);
          setNewName(jsonResponse[0].confname);

          setWebpage(jsonResponse[0].confwebpage);
          setNewWebpage(jsonResponse[0].confwebpage);

          setCity(jsonResponse[0].confcity);
          setNewCity(jsonResponse[0].confcity);

          setCountry(jsonResponse[0].confcountry);
          setNewCountry(jsonResponse[0].confcountry);

          setContact(jsonResponse[0].confcontact);
          setNewContact(jsonResponse[0].confcontact);

          setSubmissionStart(jsonResponse[0].confstartsubmission)
          setNewSubmissionStart(jsonResponse[0].confstartsubmission)

          setSubmissionEnd(jsonResponse[0].confendsubmission)
          setNewSubmissionEnd(jsonResponse[0].confendsubmission)

          setBiddingStart(jsonResponse[0].confstartbidding)
          setNewBiddingStart(jsonResponse[0].confstartbidding)

          setBiddingEnd(jsonResponse[0].confendbidding)
          setNewBiddingEnd(jsonResponse[0].confendbidding)

          setReviewStart(jsonResponse[0].confstartreview)
          setNewReviewStart(jsonResponse[0].confstartreview)

          setReviewEnd(jsonResponse[0].confendreview)
          setNewReviewEnd(jsonResponse[0].confendreview)

          setConfStart(jsonResponse[0].confstartdate)
          setNewConfStart(jsonResponse[0].confstartdate)

          setConfEnd(jsonResponse[0].confenddate)
          setNewConfEnd(jsonResponse[0].confenddate)

          setMinReviewers(jsonResponse[0].confminreviewers)
          setNewMinReviewers(jsonResponse[0].confminreviewers)

          setMaxReviewers(jsonResponse[0].confmaxreviewers)
          setNewMaxReviewers(jsonResponse[0].confmaxreviewers)

          setSubmissionUpdate(jsonResponse[0].confsubupdate)
          setNewSubmissionUpdate(jsonResponse[0].confsubupdate)
        } else {
          setMessage(<Alert severity="error">{jsonResponse.msg}</Alert>);
        }

      } catch {
        setMessage(
          <Alert severity="error">
            Something went wrong when obtaining the conference definitions
          </Alert>
        );
      }
      setOpenLoading(false);
    }

    if (isLoggedIn && confID) {
      getConfData();
    }
  }, [isLoggedIn, confID])

  async function handleSubmit(event) {
    event.preventDefault();
    if (makeRequest()) {
      if (valideInputs) {
          await saveUserData();
      } else {
        setMessage(
          <Alert severity="error">All fields marked with * are required.</Alert>
        );
      }
    }
  }

  function makeRequest() {
    if (
      name !== newName ||
      webpage !== newWebpage ||
      city !== newCity ||
      country !== newCountry ||
      contact !== newContact ||
      submissionsStart !== newSubmissionsStart ||
      submissionsEnd !== newSubmissionsEnd ||
      biddingStart !== newBiddingStart ||
      biddingEnd !== newBiddingEnd ||
      reviewStart !== newReviewStart ||
      reviewEnd !== newReviewEnd ||
      confStart !== newConfStart ||
      confEnd !== newConfEnd ||
      minReviewers !== newMinReviewers ||
      maxReviewers !== newMaxReviewers ||
      submissionUpdate !== newSubmissionUpdate
    ) {
      return true;
    } else {
      return false;
    }
  }

  function valideInputs() {
    if (newName === "" || newCity === "" || newCountry === "" || newContact === "" || newSubmissionsStart === "" || newSubmissionsEnd === "" || newBiddingStart === "" || newBiddingEnd === "" || newReviewStart === "" || newReviewEnd === "" || newConfStart === "" || newConfEnd === "" || newReviewEnd === "" || newMinReviewers === "" || newMaxReviewers === "" || newSubmissionUpdate === ""){
      return false;
    } else { return true; }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // adiciona zero à esquerda se necessário
    let day = date.getDate().toString().padStart(2, '0'); // adiciona zero à esquerda se necessário
    return `${year}-${month}-${day}`;
  };

  async function saveUserData() {
    setOpenLoading(true);
    try {
      const response = await fetch("http://localhost:8003/saveConfDefinitions", {
        method: "POST",
        body: JSON.stringify({
          confid: confID, 
          confname: newName,
          confwebpage: newWebpage,
          confcity: newCity,
          confcountry: newCountry,
          confcontact: newContact,
          confstartsubmission: newSubmissionsStart,
          confendsubmission: newSubmissionsEnd,
          confstartbidding: newBiddingStart,
          confendbidding: newBiddingEnd,
          confstartreview: newReviewStart,
          confendreview: newReviewEnd,
          confstartdate: newConfStart,
          confenddate: newConfEnd,
          confminreviewers: newMinReviewers,
          confmaxreviewers: newMaxReviewers,
          confsubupdate: newSubmissionUpdate,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        credentials: "include",
      });

      const jsonResponse = await response.json();

      if (response.status === 200) {
        setMessage(
          <Alert severity="success">{"Your data was saved with success"}</Alert>
        );

        setName(newName);
        setWebpage(newWebpage);
        setCity(newCity);
        setCountry(newCountry);
        setContact(newContact);
        setSubmissionStart(newSubmissionsStart);
        setSubmissionEnd(newSubmissionsEnd);
        setBiddingStart(newBiddingStart);
        setBiddingEnd(newBiddingEnd);
        setReviewStart(newReviewStart);
        setReviewEnd(newReviewEnd);
        setConfStart(newConfStart);
        setConfEnd(newConfEnd);
        setMinReviewers(newMinReviewers);
        setMaxReviewers(newMaxReviewers);
        setSubmissionUpdate(newSubmissionUpdate);

      } else {
        setMessage(<Alert severity="error">{jsonResponse.msg}</Alert>);
      }
    } catch (error) {
      setMessage(
        <Alert severity="error">
          Something went wrong when obtaining your informations
        </Alert>
      );
    }
    setOpenLoading(false);
  }

  return (
    <>
    {openLoading && <LoadingCircle />}
    <DashboardLayout>
      <ConfNavbar />
      <Container maxWidth="sm">
        <MDBox mt={10} mb={2} textAlign="left">
          <MDBox mb={3} textAlign="left">
            <Card>
              <MDTypography ml={2} variant="h6">
                Definitions
              </MDTypography>
              <MDTypography ml={2} variant="body2">
                To edit details from your conference simply click on 'edit'
              </MDTypography>
            </Card>
          </MDBox>

          {message}
          
          <MDBox mb={3} textAlign="left">
            <MDButton
              variant="gradient"
              color="info"
              sx={{ mt: 2, mb: 2 }}
              onClick={() => {
                setEditModeActive(true);
                setMessage(null);
              }}>
              Edit Conference Definitions
            </MDButton>

            <Card sx={{ maxWidth: 1400 }}>
              <MDBox mt={1} mb={1} textAlign="center"></MDBox>
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      name="confname"
                      required
                      fullWidth
                      id="confname"
                      label="Conference Name"
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={!editModeActive}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      id="confwebpage"
                      label="Conference Web Page"
                      name="confwebpage"
                      value={newWebpage}
                      onChange={(e) => setNewWebpage(e.target.value)}
                      disabled={!editModeActive}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confcity"
                      label="City"
                      name="confcity"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      disabled={!editModeActive}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confcountry"
                      label="Country"
                      name="confcountry"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      disabled={!editModeActive}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confcontact"
                      label="Support Contact"
                      name="confcontact"
                      value={newContact}
                      disabled={!editModeActive}
                      onChange={(e) => setNewContact(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="confsubupdate"
                        sx={{ ml: 2, mt: 3, width: "90%" }}
                      >Submissions Update</InputLabel>
                      <Select
                        required
                        fullWidth
                        labelId="confsubupdate"
                        label="Submissions Update"
                        id="confsubupdate"
                        value={newSubmissionUpdate}
                        disabled={!editModeActive}
                        onChange={(e) => setNewSubmissionUpdate(e.target.value)}
                        sx={{ ml: 2, mt: 3.5, width: "90%" }}
                      >
                        <MenuItem value={true}>True</MenuItem>
                        <MenuItem value={false}>False</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confstartsubmission"
                      label="Submissions Start Date"
                      name="confstartsubmission"
                      type="date"
                      value={formatDate(newSubmissionsStart)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewSubmissionStart(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confendsubmission"
                      label="Submissions End Date"
                      name="confendsubmission"
                      type="date"
                      value={formatDate(newSubmissionsEnd)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewSubmissionEnd(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confstartbidding"
                      label="Bidding Start Date"
                      name="confstartbidding"
                      type="date"
                      value={formatDate(newBiddingStart)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewBiddingStart(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confendbidding"
                      label="Bidding End Date"
                      name="confendbidding"
                      type="date"
                      value={formatDate(newBiddingEnd)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewBiddingEnd(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confstartreview"
                      label="Reviews Start Date"
                      name="confstartreview"
                      type="date"
                      value={formatDate(newReviewStart)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewReviewStart(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confendreview"
                      label="Reviews End Date"
                      name="confendreview"
                      type="date"
                      value={formatDate(newReviewEnd)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewReviewEnd(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confstartdate"
                      label="Conferance Start Date"
                      name="confstartdate"
                      type="date"
                      value={formatDate(newConfStart)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewConfStart(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confenddate"
                      label="Conference End Date"
                      name="confenddate"
                      type="date"
                      value={formatDate(newConfEnd)}
                      disabled={!editModeActive}
                      onChange={(e) => setNewConfEnd(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confminreviewers"
                      label="Minimun Number of Reviews"
                      name="confminreviewers"
                      value={newMinReviewers}
                      disabled={!editModeActive}
                      onChange={(e) => setNewMinReviewers(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      required
                      fullWidth
                      id="confmaxreviewers"
                      label="Maximum Number of Reviews"
                      name="confmaxreviewers"
                      value={newMaxReviewers}
                      disabled={!editModeActive}
                      onChange={(e) => setNewMaxReviewers(e.target.value)}
                      sx={{ ml: 2, mt: 2, width: "90%" }}
                    />
                  </Grid>
                </Grid>
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="info"
                  sx={{
                    ml: 2,
                    mt: 2,
                    mb: 2,
                    display: editModeActive ? "block" : "none",
                  }}
                  onClick={() => setEditModeActive(false)}
                >
                  Save Changes
                </MDButton>
                <MDBox mt={3} mb={1} textAlign="center"></MDBox>
              </Box>
            </Card>
          </MDBox>
        </MDBox>
      </Container>
    </DashboardLayout>
    </>
  );
}
