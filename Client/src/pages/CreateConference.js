import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth.context";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Footer from "OurComponents/footer/Footer";
import UpperNavBar from "OurComponents/navBars/UpperNavBar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import * as React from "react";
import Card from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MDTypography from "components/MDTypography";
import moment from 'moment';

export default function CreateConference() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [disclaimer, setDisclaimer] = React.useState("");
  const [message, setMessage] = useState(null);
  const [confType, setConfType] = useState("");
  const [confArea, setConfArea] = useState("");
  const [submissionStartDate, setSubmissionStartDate] = useState("");
  const [reviewStartDate, setReviewStartDate] = useState("");
  const [biddingStartDate, setBiddingStartDate] = useState("");
  const [submissionEndDate, setSubmissionEndDate] = useState("");
  const [reviewEndDate, setReviewEndDate] = useState("");
  const [biddingEndDate, setBiddingEndDate] = useState("");
  const [conferenceTypes, setConferenceTypes] = useState([]);
  const [conferenceAreas, setConferenceAreas] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);

  //Handles the disclaimers in the Date picker
  const handleConfDate = (event) => {
    const newStartDate = new Date(event.target.value);
    const todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + 10);
    if (newStartDate <= todayDate) {
      setDisclaimer("Conference Start Date in minimum 10days.");
    } else {
      setDisclaimer("");
    }
  };

  const startDateChange = (event, disclaimerMessage) => {
    const newstartDate = event.target.value;
    if (newstartDate >= startDate) {
      setDisclaimer(disclaimerMessage);
    } else {
      setDisclaimer("");
    }
  };

  const endDateChange = (event, startDate, setEndDate, disclaimerMessage) => {
    const newEndDate = event.target.value;
    setEndDate(newEndDate);
    if (newEndDate < startDate) {
      setDisclaimer(disclaimerMessage);
    } else {
      setDisclaimer("");
    }
  };

  const startDateComparison = (event, endDate, setStartDate, disclaimerMessage) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
    if (newStartDate <= endDate) {
      setDisclaimer(disclaimerMessage);
    } else {
      setDisclaimer("");
    }
  };

  const confDateChange = (event) => {
    endDateChange(event, startDate, setEndDate, "Conference end date cannot be earlier than Conference start date.");
  };

  const submissionStartDateChange = (event) => {
    startDateChange(event, "Submission start date cannot be superior or equal to the Conference start date.");
  };
  
  const submissionEndDateChange = (event) => {
    endDateChange(event, submissionStartDate, setSubmissionEndDate, "Submission end date cannot be earlier than Submission start date.");
  };

  const submissionEndDateComparison = (event) => {
    startDateChange(event, "Submission end date cannot be superior than Conference start date.");
  };

  const biddingStartDateChange = (event) => {
    startDateComparison(event, submissionEndDate, setBiddingStartDate, "Bidding start date cannot be inferior or equal to the Submission end date.");
  };

  const biddingEndDateChange = (event) => {
    endDateChange(event, biddingStartDate, setBiddingEndDate, "Bidding end date cannot be earlier than Bidding start date.");
  };

  const biddingEndDateComparison = (event) => {
    startDateChange(event, "Bidding end date cannot be superior than Conference start date.");
  };

  const reviewStartDateChange = (event) => {
    startDateComparison(event, biddingEndDate, setReviewStartDate, "Review start date cannot be inferior or equal to the Bidding end date.");
  };

  const reviewEndDateChange = (event) => {
    endDateChange(event, reviewStartDate, setReviewEndDate, "Review end date cannot be earlier than Review start date.");
  };

  const reviewEndDateComparison = (event) => {
    startDateChange(event, "Review end date cannot be superior than Conference start date.");
  };

  //Handles the Dropdown menus
  const handleTypeChange = (event) => {
    setConfType(event.target.value);
  };

  const handleAreaChange = (event) => {
    setConfArea(event.target.value);
  };

  const fetchConferenceTypes = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getConfTypes`, {
      
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      credentials: "include",
    });
    const data = await response.json();
    setConferenceTypes(data);
  };

  const fetchConferenceAreas = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getConfAreas`, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      credentials: "include",
    });
    const data = await response.json();
    setConferenceAreas(data);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchConferenceTypes();
      fetchConferenceAreas();
      addFieldEventListeners();
    }
  }, [isLoggedIn]);

  const handleFieldClick = () => {
    setMessage(null); 
  };
  
  const addFieldEventListeners = () => {
    const formFields = document.querySelectorAll('input, select, textarea');
  
    formFields.forEach(field => {
      field.addEventListener('click', handleFieldClick); 
    });
  };

  //Handles Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
  const data = new FormData(event.currentTarget);
  const formData = Object.fromEntries(data.entries());
  
  const allFieldsEmpty = Object.values(formData).every(value => !value);

  if (allFieldsEmpty) {
    setMessage(<Alert severity="error">All the fields are empty. <br></br>Please provide values.</Alert>);
    return;
  }
  
  const requiredFields = [
    "title",
    "startDate",
    "endDate",
    "submissionStartDate",
    "submissionEndDate",
    "reviewStartDate",
    "reviewEndDate",
    "biddingStartDate",
    "biddingEndDate",
    "description",
    "country",
    "city",
    "numberMinReviewrs",
    "numberMaxReviewrs",
    "numberMaxSubmissions",
    "confLink"
  ];

  const fieldMappings = {
    title: "Title",
    startDate: "Conference Start Date",
    endDate: "Conference End Date",
    submissionStartDate: "Submission Start Date",
    submissionEndDate: "Submission End Date",
    reviewStartDate: "Review Start Date",
    reviewEndDate: "Review End Date",
    biddingStartDate: "Bidding Start Date",
    biddingEndDate: "Bidding End Date",
    description: "Description",
    country: "Country",
    city: "City",
    numberMinReviewrs: "Nº min Reviewrs",
    numberMaxReviewrs: "Nº max reviewrs",
    numberMaxSubmissions: "Nº max Submissions",
    confLink: "Conference Webpage"
  };

  const missingFields = requiredFields
    .filter(field => !formData[field])
    .map(field => fieldMappings[field] || field); 

  if (missingFields.length > 0) {
    const missingFieldsMessage = `Please provide values for the following fields: ${missingFields.join(", ")}`;
    setMessage(<Alert severity="error">{missingFieldsMessage}</Alert>);
    return
  }
  
    const {
      title,
      startDate,
      endDate,
      submissionStartDate,
      submissionEndDate,
      reviewStartDate,
      reviewEndDate,
      biddingStartDate,
      biddingEndDate,
      description,
      country,
      city,
      numberMinReviewrs,
      numberMaxReviewrs,
      numberMaxSubmissions,
      confLink,
    } = formData;

    await createConference(
      title,
      user,
      confType,
      confArea,
      startDate,
      endDate,
      submissionStartDate,
      submissionEndDate,
      reviewStartDate,
      reviewEndDate,
      biddingStartDate,
      biddingEndDate,
      description,
      country,
      city,
      numberMinReviewrs,
      numberMaxReviewrs,
      numberMaxSubmissions,
      confLink
    );
  };

  const createConference = async (
    title,
    user,
    confType,
    confArea,
    startDate,
    endDate,
    submissionStartDate,
    submissionEndDate,
    reviewStartDate,
    reviewEndDate,
    biddingStartDate,
    biddingEndDate,
    description,
    country,
    city,
    numberMinReviewrs,
    numberMaxReviewrs,
    numberMaxSubmissions,
    confLink
  ) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/createConference`, {
        method: "POST",
        body: JSON.stringify({
          title: title,
          user: user,
          confType: confType,
          confArea: confArea,
          startDate: startDate,
          endDate: endDate,
          submissionStartDate: submissionStartDate,
          submissionEndDate: submissionEndDate,
          reviewStartDate: reviewStartDate,
          reviewEndDate: reviewEndDate,
          biddingStartDate: biddingStartDate,
          biddingEndDate: biddingEndDate,
          description: description,
          country: country,
          city: city,
          numberMinReviewrs: numberMinReviewrs,
          numberMaxReviewrs: numberMaxReviewrs,
          numberMaxSubmissions: numberMaxSubmissions,
          confLink: confLink,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        credentials: "include",
      });

      const jsonResponse = await response.json();
      if (response.status === 200) {
        setMessage(
          <Alert severity="success">{"Yor data was saved with success"}</Alert>
        );
      } else {
        setMessage(<Alert severity="error">{jsonResponse.msg}</Alert>);
      }
    } catch (error) {
      setMessage(<Alert severity="error">Something went wrong!</Alert>);
    }
  };

  const today = moment().format('YYYY-MM-DD');
  const minStartDate = moment().add(5, 'days').format('YYYY-MM-DD');
  const previousDay = moment(startDate).subtract(1, 'days').format('YYYY-MM-DD');
  const minDate = moment(submissionStartDate).format('YYYY-MM-DD');
  const nextDay = moment(submissionEndDate).add(1, 'days').format('YYYY-MM-DD');
  const minDateBidding = moment(biddingStartDate).format('YYYY-MM-DD');
  const minDateReview = moment(reviewStartDate).format('YYYY-MM-DD');
  const nextDayBidding = moment(biddingEndDate).add(1, 'days').format('YYYY-MM-DD');

  return (
    // <DashboardLayout>
    <DashboardLayout>
      <UpperNavBar />

      <MDBox
        mb={3}
        mt={2}
        textAlign="left"
        sx={{
          maxWidth: 700,
          margin: "auto",
          marginBottom: 2,
        }}
      >
        <Card>
          <MDTypography ml={2} variant="h6">
            Create Conference
          </MDTypography>
          <MDTypography ml={2} variant="body2">
            Fill the form to create a conference
          </MDTypography>
        </Card>
      </MDBox>

      <MDBox mb={3}>
        <Card
          sx={{
            maxWidth: 700,
            margin: "auto",
            marginBottom: "50px",
          }}
        >
          <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Box>
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      autoComplete="given-name"
                      name="title"
                      required
                      fullWidth
                      id="title"
                      label="Title"
                      autoFocus
                      sx={{ mt: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Select
                      id="confType"
                      onChange={handleTypeChange}
                      value={confType}
                      fullWidth
                      required
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Conference Type
                      </MenuItem>
                      {conferenceTypes.map((conferenceType) => (
                        <MenuItem
                          key={conferenceType.conftypename}
                          value={conferenceType.conftypename}
                        >
                          {conferenceType.conftypename}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Select
                      id="confArea"
                      onChange={handleAreaChange}
                      value={confArea}
                      fullWidth
                      required
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Conference Area
                      </MenuItem>
                      {conferenceAreas.map((conferenceArea) => (
                        <MenuItem
                          key={conferenceArea.confareaname}
                          value={conferenceArea.confareaname}
                        >
                          {conferenceArea.confareaname}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      name="country"
                      label="Country"
                      type="text"
                      id="country"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      autoComplete="given-name"
                      name="city"
                      id="city"
                      label="City"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={3}
                      name="description"
                      label="Description"
                      type="text"
                      id="description"
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="confLink"
                      label="Conference Webpage"
                      type="url"
                      id="confLink"
                      sx={{ marginBottom: "15px" }}
                    />
                  </Grid>
                  <div>
                    <Grid container spacing={2} ml={0} mr={0} sm="auto">
                      <Grid item xs={11.5} md={6}>
                        <TextField
                          required
                          fullWidth
                          name="startDate"
                          label="Conference Start Date"
                          type="date"
                          id="startDate"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: minStartDate }}
                          onChange={(event) => {
                            setStartDate(event.target.value);
                            handleConfDate(event);
                          }}
                        />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                      <TextField
                        required
                        fullWidth
                        name="endDate"
                        label="Conference End Date"
                        type="date"
                        id="endDate"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: startDate }}
                        onChange={(event) => {
                          setEndDate(event.target.value);
                          confDateChange(event);
                        }}
                      />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                        <TextField
                          required
                          fullWidth
                          name="submissionStartDate"
                          label="Submission Start Date"
                          type="date"
                          id="submissionStartDate"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ max: previousDay }}
                          onChange={(event) => {
                            setSubmissionStartDate(event.target.value);
                            submissionStartDateChange(event);
                          }}
                        />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                      <TextField
                        required
                        fullWidth
                        name="submissionEndDate"
                        label="Submission End Date"
                        type="date"
                        id="submissionEndDate"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: minDate, max: previousDay }}
                        onChange={(event) => {
                          setSubmissionEndDate(event.target.value);
                          submissionEndDateChange(event);
                          submissionEndDateComparison(event);
                        }}
                      />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                      <TextField
                        required
                        fullWidth
                        name="biddingStartDate"
                        label="Bidding Start Date"
                        type="date"
                        id="biddingStartDate"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: nextDay, max: previousDay }} 
                        onChange={(event) => {
                          setBiddingStartDate(event.target.value);
                          biddingStartDateChange(event);
                        }}
                      />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                        <TextField
                          required
                          fullWidth
                          name="biddingEndDate"
                          label="Bidding End Date"
                          type="date"
                          id="biddingEndDate"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: minDateBidding, max: previousDay }}
                          onChange={(event) => {
                            setBiddingEndDate(event.target.value);
                            biddingEndDateChange(event);
                            biddingEndDateComparison(event);
                          }}
                        />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                        <TextField
                          required
                          fullWidth
                          name="reviewStartDate"
                          label="Review Start Date"
                          type="date"
                          id="reviewStartDate"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: nextDayBidding, max: previousDay }}
                          onChange={(event) => {
                            setReviewStartDate(event.target.value);
                            reviewStartDateChange(event);
                          }}
                        />
                      </Grid>
                      <Grid item xs={11.5} md={6}>
                        <TextField
                          required
                          fullWidth
                          name="reviewEndDate"
                          label="Review End Date"
                          type="date"
                          id="reviewEndDate"
                          InputLabelProps={{ shrink: true }}
                          sx={{ mb: "15px" }}
                          inputProps={{ min: minDateReview, max: previousDay }}
                          onChange={(event) => {
                            setReviewEndDate(event.target.value);
                            reviewEndDateChange(event);
                            reviewEndDateComparison(event);
                          }}
                        />
                      </Grid>
                    </Grid>
                    {disclaimer && (
                      <Box sx={{ ml: 2, mb: 2 }}>
                        <Alert severity="warning">{disclaimer}</Alert>
                      </Box>
                    )}
                  </div>
                  <Grid container spacing={2} ml={0} mr={0}>
                    <Grid item xs={4} md={4}>
                      <TextField
                        required
                        fullWidth
                        name="numberMinReviewrs"
                        label="Nº min Reviewers"
                        type="number"
                        id="numberMinReviewrs"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={4} md={4}>
                      <TextField
                        required
                        fullWidth
                        name="numberMaxReviewrs"
                        label="Nº max Reviewers"
                        type="number"
                        id="numberMaxReviewrs"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={4} md={4}>
                      <TextField
                        required
                        fullWidth
                        name="numberMaxSubmissions"
                        label="Nº max Submissions"
                        type="number"
                        id="numberMaxSubmissions"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="info"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Create Conference
                </MDButton>
                {message}
                <MDBox mt={3} mb={1} textAlign="center"></MDBox>
              </Box>
            </Box>
          </Container>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
