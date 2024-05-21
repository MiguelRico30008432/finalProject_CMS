import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ConfNavbar from "../../OurComponents/navBars/ConferenceNavBar";
import { ConferenceContext } from "conference.context";
import { AuthContext } from "auth.context";
import * as React from "react";
import { useEffect, useState, useContext } from "react";
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
import PopUpWithMessage from "OurComponents/Info/PopUpWithMessage"; // Ensure this import is correct

export default function AllSubmissions() {
  const { confID, userRole } = useContext(ConferenceContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [openLoading, setOpenLoading] = useState(false);
  const [message, setMessage] = useState(null);
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
          const transformedData = jsonResponse.map((submission) => ({
            id: submission.id,
            title: submission.title,
            authors: submission.authors,
            status: submission.status ? "Accepted" : "Pending",
            addDate: submission.adddate,
            abstract: submission.abstract,
            fileUrl: submission.fileUrl,
          }));
          setRows(transformedData);
        } else {
          setMessage(<Alert severity="error">{jsonResponse.message}</Alert>);
        }
      } catch (error) {
        setMessage(
          <Alert severity="error">Failed to fetch conference details!</Alert>
        );
      }
      setOpenLoading(false);
    }

    if (isLoggedIn && confID) {
      fetchAllSubmissions();
    }
  }, [confID, isLoggedIn]);

  const handleDelete = async () => {
    setMessage(null);
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
        setMessage(
          <Alert severity="success">Submission deleted successfully</Alert>
        );
      } else {
        setMessage(<Alert severity="error">{jsonResponse.msg}</Alert>);
      }
    } catch (error) {
      setMessage(<Alert severity="error">Could not delete submission</Alert>);
    }

    setOpenLoading(false);
  };

  const handleDownload = async (submission) => {
    setMessage(null);
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
        setMessage("Failed to download file: " + jsonResponse.msg);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = submission.title + ".pdf"; // Set the file name
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMessage(<Alert severity="error">Could not download file</Alert>);
    }

    setOpenLoading(false);
  };

  const columns = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "authors", headerName: "Authors", width: 200 },
    { field: "addDate", headerName: "Submission Date", width: 120 },
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
      field: "moreInfo",
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
    ...(userRole === "Chair" || userRole === "Owner"  ? [{
      field: "delete",
      filterable: false,
      headerName: "",
      description: "",
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 150,
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
    }] : [])
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

        <Container maxWidth="sm">
          <MDBox mt={8} mb={2} textAlign="left">
            <MDBox mb={3} textAlign="left">
              <Card>
                <MDTypography ml={2} variant="h6">
                  All Submissions
                </MDTypography>
                <MDTypography ml={2} variant="body2">
                  Welcome to the My Submissions Page! Here, you can manage all
                  your conference submissions. You can view details of each
                  submission, including title, authors, status, and date. Easily
                  update your submissions by clicking the "Edit" button,
                  download submitted files by clicking "Download File," and
                  remove a submission by clicking "Delete Submission" and
                  confirming your action.
                </MDTypography>
              </Card>

              <Card sx={{ mt: 2, mb: 2 }}>{message}</Card>

              <MDBox mb={3} mt={2} textAlign="left">
                <Card>
                  <CompleteTable
                    columns={columns}
                    rows={rows}
                    numberOfRowsPerPage={100}
                    height={200}
                  />
                </Card>
              </MDBox>
            </MDBox>
          </MDBox>
        </Container>

        {detailsOpen && (
          <SubmissionDetails
            submission={dataForDetails}
            onClose={() => setDetailsOpen(false)}
          />
        )}

        <Footer />
      </DashboardLayout>
    </>
  );
}