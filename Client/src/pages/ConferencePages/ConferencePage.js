//Layout Component
import ConferencesLayout from "OurLayouts/ConferencesLayout";
import bgImage from "assets/images/conference_signin.jpeg";
import { ConferenceContext } from "conference.context";

// @mui material components
import * as React from "react";
import { useEffect, useState, useContext } from "react";
import Card from "@mui/material/Card";

export default function ConferencePage() {
  const { confID, userRole } = useContext(ConferenceContext);

  console.log(confID);

  return (
    <ConferencesLayout image={bgImage}>
      <Card></Card>
    </ConferencesLayout>
  );
}
