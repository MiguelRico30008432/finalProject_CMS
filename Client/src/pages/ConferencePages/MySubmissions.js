import React, { useEffect, useState, useContext } from "react";
import MDButton from "components/MDButton";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import LoadingCircle from "OurComponents/loading/LoadingCircle";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "OurComponents/footer/Footer";
import ConferenceNavBar from "OurComponents/navBars/ConferenceNavBar";
import CompleteTable from "OurComponents/Table/CompleteTable";
import SubmissionsDetails from "OurComponents/Info/SubmissionDetails";
import UpdateSubmission from "OurComponents/Info/updateSubmission";

import { AuthContext } from "auth.context";
import { ConferenceContext } from "conference.context";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

export default function MySubmissionsPage() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dataForDetails, setDataForDetails] = useState({});
  const [dataForUpdate, setDataForUpdate] = useState({});
  const [update, setUpdate] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const { user } = useContext(AuthContext);
  const { confID } = useContext(ConferenceContext);

  useEffect(() => {
    async function fetchSubmissions() {
      setOpenLoading(true);

      if (confID && user) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/mySubmissions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
              },
              credentials: "include",
              body: JSON.stringify({
                userID: user,
                confID: confID,
              }),
            }
          );

          const jsonResponse = await response.json();

          if (response.ok) {
            const transformedData = jsonResponse.map((submission) => ({
              id: submission.id,
              title: submission.title,
              authors: submission.authors,
              status: submission.status ? "Accepted" : "Pending",
              addDate: formatDate(submission.addDate),
              abstract: submission.abstract,
              fileUrl: submission.fileUrl, // Assuming the file URL is included
            }));
            setRows(transformedData);
          } else {
            setError("Failed to fetch submissions: " + jsonResponse.message);
          }
        } catch (error) {
          setError("Network error: Could not fetch submissions");
        }
      }
      setOpenLoading(false);
    }

    fetchSubmissions();
  }, [confID, user]);

  const handleDelete = async (submission) => {
    setDeleteError("");
    setDeleteSuccessMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/deleteSubmission`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        credentials: "include",
        body: JSON.stringify({
          submissionID: submission.id,
        }),
      });

      const jsonResponse = await response.json();

      if (response.ok) {
        setRows(rows.filter((row) => row.id !== submission.id));
        setDeleteSuccessMessage("Submission deleted successfully");
      } else {
        setDeleteError("Failed to delete submission: " + jsonResponse.msg);
      }
    } catch (error) {
      setDeleteError("Network error: Could not delete submission");
    }
  };

  const handleDownload = async (submission) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/downloadSubmissionFile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            credentials: "include",
            body: JSON.stringify({
                submissionID: submission.id,
            }),
        });

        if (!response.ok) {
            const jsonResponse = await response.json();
            setError("Failed to download file: " + jsonResponse.msg);
            console.error("Failed to download file:", jsonResponse.msg);
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.title + ".pdf"; // Set the file name
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        setError("Network error: Could not download file");
        console.error("Network error: Could not download file", error);
    }
};

  const columns = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "authors", headerName: "Authors", width: 200 },
    {
      field: "actions",
      headerName: "", // No title for actions column
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      width: 400, // Increase the width to accommodate longer button labels
      renderCell: (params) => (
        <MDBox display="flex" justifyContent="center" alignItems="center" gap={1} width="100%" height="100%">
          <MDButton
            variant="gradient"
            color="warning"
            onClick={() => handleDownload(params.row)}
            sx={{
              maxWidth: "150px",
              maxHeight: "30px",
              minWidth: "30px",
              minHeight: "30px",
              fontSize: "0.75rem", // Smaller font size
              padding: "5px", // Compact padding
            }}
          >
            Download File
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => {
              setDataForDetails(params.row);
              setDetailsOpen(true);
            }}
            sx={{
              maxWidth: "80px",
              maxHeight: "30px",
              minWidth: "30px",
              minHeight: "30px",
              fontSize: "0.75rem", // Smaller font size
              padding: "5px", // Compact padding
            }}
          >
            Details
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            onClick={() => {
              setDataForUpdate(params.row.id);
              setUpdate(true);
            }}
            sx={{
              maxWidth: "80px",
              maxHeight: "30px",
              minWidth: "30px",
              minHeight: "30px",
              fontSize: "0.75rem", // Smaller font size
              padding: "5px", // Compact padding
            }}
          >
            Edit
          </MDButton>
          <MDButton
            variant="gradient"
            color="error"
            onClick={() => handleDelete(params.row)}
            sx={{
              maxWidth: "150px",
              maxHeight: "30px",
              minWidth: "30px",
              minHeight: "30px",
              fontSize: "0.75rem", // Smaller font size
              padding: "5px", // Compact padding
            }}
          >
            Delete Submission
          </MDButton>
        </MDBox>
      ),
    },
  ];

  return (
    <>
      {openLoading && <LoadingCircle />}
      <DashboardLayout>
        <ConferenceNavBar />
        <Container maxWidth="sm">
          <MDBox mt={10} mb={2} textAlign="left">
            <Card>
              <MDTypography ml={2} variant="h6">
                My Submissions
              </MDTypography>
              <MDTypography ml={2} variant="body2">
                Here you can view and manage your submissions.
              </MDTypography>
            </Card>
            <MDBox mb={3} textAlign="left">
              {error && <Alert severity="error">{error}</Alert>}
              {deleteError && <Alert severity="error">{deleteError}</Alert>}
              {deleteSuccessMessage && (
                <Alert severity="success">{deleteSuccessMessage}</Alert>
              )}
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
        </Container>
        {!detailsOpen ? null : (
          <SubmissionsDetails
            submission={dataForDetails}
            onClose={() => setDetailsOpen(false)}
          />
        )}
        {update && (
          <UpdateSubmission
            submission={dataForUpdate}
            onClose={() => setUpdate(false)}
          />
        )}
        <Footer />
      </DashboardLayout>
    </>
  );
}