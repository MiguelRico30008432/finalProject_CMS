import React, { useEffect, useState, useContext } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ConfNavbar from "../../OurComponents/navBars/ConferenceNavBar";
import { ConferenceContext } from "conference.context";
import { AuthContext } from "auth.context";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import LoadingCircle from "OurComponents/loading/LoadingCircle";
import Alert from "@mui/material/Alert";
import CompleteTable from "OurComponents/Table/CompleteTable";
import SubmissionDetails from "OurComponents/Info/SubmissionDetails";
import Footer from "OurComponents/footer/Footer";
import PopUpWithMessage from "OurComponents/Info/PopUpWithMessage";
import ModalInfo from "OurComponents/Modal/ModalInfo";

export default function AllSubmissions() {
  const { confID, userRole, confPhase } = useContext(ConferenceContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [openLoading, setOpenLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dataForDetails, setDataForDetails] = useState({});
  const [openPopUpMessage, setOpenPopUpMessage] = useState(false);
  const [dataForDelete, setDataForDelete] = useState(null);

  useEffect(() => {
    async function fetchAllSubmissions() {
      setOpenLoading(true);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/allSubmissions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
            credentials: "include",
            body: JSON.stringify({ confID: confID }),
          }
        );

        const jsonResponse = await response.json();
        if (response.status === 200) {
          setRows(jsonResponse);
        } else {
          setError(<Alert severity="error">{jsonResponse.message}</Alert>);
        }
      } catch (error) {
        setError(
          <Alert severity="error">Failed to fetch conference details!</Alert>
        );
      }
      setOpenLoading(false);
    }

    if (isLoggedIn && confID) {
      fetchAllSubmissions();
    }
  }, [confID, isLoggedIn]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDelete = async () => {
    setError(null);
    setOpenLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/deleteSubmission`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          credentials: "include",
          body: JSON.stringify({
            submissionID: dataForDelete,
          }),
        }
      );

      const jsonResponse = await response.json();

      if (response.ok) {
        setRows((rows) => rows.filter((row) => row.id !== dataForDelete));
        setError(
          <Alert severity="success">Submission deleted successfully</Alert>
        );
      } else {
        setError(<Alert severity="error">{jsonResponse.msg}</Alert>);
      }
    } catch (error) {
      setError(<Alert severity="error">Could not delete submission</Alert>);
    }

    setOpenLoading(false);
  };

  const handleDownload = async (submission) => {
    setError(null); // Clear previous errors
    setOpenLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/downloadSubmissionFile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          credentials: "include",
          body: JSON.stringify({
            submissionID: submission.id,
          }),
        }
      );

      if (!response.ok) {
        const jsonResponse = await response.json();
        setError(
          <Alert severity="error">
            Failed to download file: {jsonResponse.msg}
          </Alert>
        );
        setOpenLoading(false); // Stop loading indicator
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = submission.title + ".pdf"; // Set the file name
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(<Alert severity="error">Could not download file</Alert>);
    }

    setOpenLoading(false); // Stop loading indicator
  };

  const columns = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "mainauthor", headerName: "Main Author", width: 200 },
    { field: "adddate", headerName: "Submission Date", width: 120 },
    {
      field: "download",
      filterable: false,
      headerName: "",
      description: "",
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 130,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <MDButton
              variant="gradient"
              color="warning"
              onClick={() => handleDownload(params.row)}
              sx={{
                maxWidth: "120px",
                maxHeight: "23px",
                minWidth: "30px",
                minHeight: "23px",
              }}
            >
              Download File
            </MDButton>
          </div>
        );
      },
    },
    {
      field: "details",
      headerName: "",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 80,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => {
                setDataForDetails(params.row);
                setDetailsOpen(true);
              }}
              sx={{
                maxWidth: "60px",
                maxHeight: "23px",
                minWidth: "30px",
                minHeight: "23px",
              }}
            >
              Details
            </MDButton>
          </div>
        );
      },
    },
    {
      field: "delete",
      filterable: false,
      headerName: "",
      description: "",
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 150,
      renderCell: (params) => {
        if (
          userRole.includes("Committee") ||
          params.row.status !== "Pending" ||
          confPhase !== "Submission"
        )
          return null;

        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <MDButton
              variant="gradient"
              color="error"
              onClick={() => {
                setDataForDelete(params.row.id);
                setOpenPopUpMessage(true);
              }}
              sx={{
                maxWidth: "130px",
                maxHeight: "23px",
                minWidth: "30px",
                minHeight: "23px",
              }}
            >
              Delete Submission
            </MDButton>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {openLoading && <LoadingCircle />}
      <PopUpWithMessage
        open={openPopUpMessage}
        handleClose={() => setOpenPopUpMessage(false)}
        handleConfirm={async () => {
          await handleDelete();
          setOpenPopUpMessage(false);
        }}
        title={"Confirm your submission removal"}
        text={"Are you sure you want to remove this submission?"}
      />

      <DashboardLayout>
        <ConfNavbar />
        <MDBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Container maxWidth="sm">
            <MDBox mt={8} mb={2} textAlign="left">
              <MDBox mb={3} textAlign="left">
                <Card>
                  <MDTypography ml={2} variant="h6">
                    All Submissions
                  </MDTypography>
                  <MDTypography ml={2} variant="body2">
                    Here you can view and manage all submissions.<br></br>
                    Note: You can only delete submissions if the current phase
                    of the conference is the submission phase.
                  </MDTypography>
                </Card>

                <Card sx={{ mt: 2, mb: 2 }}>{error}</Card>

                <MDBox mb={3} mt={2} textAlign="left">
                  <Card>
                    <CompleteTable
                      columns={columns}
                      rows={rows}
                      numberOfRowsPerPage={10}
                      height={200}
                    />
                  </Card>
                </MDBox>
              </MDBox>
            </MDBox>
          </Container>

          {detailsOpen && (
            <ModalInfo onClose={() => setDetailsOpen(false)}>
              <SubmissionDetails
                submission={dataForDetails}
                onClose={() => setDetailsOpen(false)}
                getUpdatedAuthors={false}
              />
            </ModalInfo>
          )}
        </MDBox>
        <Footer />
      </DashboardLayout>
    </>
  );
}
