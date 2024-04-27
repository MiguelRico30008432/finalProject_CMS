import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ConfNavbar from "../../OurComponents/navBars/ConferenceNavBar";
import { ConferenceContext } from "conference.context";
import * as React from "react";
import { useEffect, useState, useContext } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import Container from "@mui/material/Container";
import MDTypography from "components/MDTypography";

export default function ConferenceDetails() {
  const { confID, userRole } = useContext(ConferenceContext);

  return (
    <DashboardLayout>
      <ConfNavbar />
      <Container maxWidth="sm">
        <MDBox mt={10} mb={2} textAlign="left">
          <MDBox mb={3} textAlign="left">
            <Card>
              <MDTypography ml={2} variant="h6">
                Conference Description
              </MDTypography>
              <MDTypography ml={2} variant="body2">
                text goes here
              </MDTypography>
            </Card>
          </MDBox>
        </MDBox>
      </Container>
    </DashboardLayout>
  );
}
