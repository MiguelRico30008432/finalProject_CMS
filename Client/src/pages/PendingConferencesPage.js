import * as React from "react";
import { useEffect, useState, useContext } from "react";
import MDButton from "components/MDButton";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "OurComponents/footer/Footer";
import UpperNavBar from "OurComponents/navBars/UpperNavBar";
import CompleteTable from "OurComponents/Table/CompleteTable";
import MoreDetails from "OurComponents/Info/MoreDetails";

import { AuthContext } from "../auth.context";

export default function PendingConferencesPage() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dataForDetails, setDataForDetails] = useState({});
  const [rows, setRow] = useState([]);
  const [error, setError] = useState(null);
  const { isLoggedIn, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    async function getRows() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/pendingConferences`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            credentials: "include",
          }
        );

        const jsonResponse = await response.json();

        if (response.status === 200) {
          for (let line of jsonResponse) {
            setRow((allExistingRows) => [...allExistingRows, line]);
          }
        } else {
          setError(<Alert severity="error">{jsonResponse.msg}</Alert>);
        }
      } catch (error) {
        setError(
          <Alert severity="error">
            Something went wrong when obtaining the lines
          </Alert>
        );
      }
    }

    if (isLoggedIn && isAdmin) {
      getRows();
    }
  }, [isLoggedIn]);

  async function acceptOrRejectConference(id, accept, owner, name) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/acceptOrRejectConference`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          credentials: "include",
          body: JSON.stringify({
            confid: id,
            acceptOrReject: accept,
            confowner: owner,
            confname: name,
          }),
        }
      );
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      setError(
        <Alert severity="error">
          Something went wrong when obtaining the lines
        </Alert>
      );
    }
  }

  const columns = [
    { field: "confname", headerName: "Conference Name", width: 400 },
    { field: "confstartdate", headerName: "Conference Start Date", width: 200 },
    { field: "confenddate", headerName: "Conference End Date", width: 200 },
    {
      field: "More Info.",
      filterable: false,
      headerName: "",
      description:
        "This column has a button to give details about the conference",
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 100,
      renderCell: (params) => {
        const handleMoreDetailsButtonClick = () => {
          setDataForDetails(params.row);
          setDetailsOpen(true);
        };

        return (
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleMoreDetailsButtonClick}
            sx={{
              maxWidth: "80px",
              maxHeight: "30px",
              minWidth: "30px",
              minHeight: "30px",
            }}
          >
            Details
          </MDButton>
        );
      },
    },
    {
      field: "Aprove",
      filterable: false,
      headerName: "",
      description: "This column has a button to accept the conference",
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 100,
      renderCell: (params) => {
        const handleAcceptButtonClick = async () => {
          await acceptOrRejectConference(
            params.row.id,
            2,
            params.row.confowner,
            params.row.confname
          );
        };

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
              color="success"
              onClick={handleAcceptButtonClick}
              sx={{
                maxWidth: "80px",
                maxHeight: "30px",
                minWidth: "30px",
                minHeight: "30px",
              }}
            >
              Accept
            </MDButton>
          </div>
        );
      },
    },
    {
      field: "Reject",
      filterable: false,
      headerName: "",
      description: "This column has a button to reject the conference",
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      width: 100,
      renderCell: (params) => {
        const handleRejectButtonClick = async () => {
          await acceptOrRejectConference(
            params.row.id,
            1,
            params.row.confowner,
            params.row.confname
          );
        };

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
              onClick={handleRejectButtonClick}
              sx={{
                maxWidth: "80px",
                maxHeight: "30px",
                minWidth: "30px",
                minHeight: "30px",
              }}
            >
              Reject
            </MDButton>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <UpperNavBar />
      {!detailsOpen ? (
        <>
          {error}
          <Card>
            <CompleteTable
              columns={columns}
              rows={rows}
              numerOfRowsPerPage={100}
              height={200}
            />
          </Card>
        </>
      ) : (
        <MoreDetails
          text={dataForDetails}
          onClose={() => setDetailsOpen(false)}
        />
      )}
      <br></br>
      <Footer />
    </DashboardLayout>
  );
}
