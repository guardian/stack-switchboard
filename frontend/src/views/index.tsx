import React from "react";
import Container from "react-bootstrap/Container";
import { CLIENT_ENDPOINTS } from "../utils/values";
import { Link } from "react-router-dom";

export const Index = () => {
  return (
    <Container>
      <h1>Switchboards</h1>
      <ul style={{ fontSize: "120%" }}>
        <li>
          <Link to={CLIENT_ENDPOINTS.AUTOSCALING_GROUPS}>
            Autoscaling Groups
          </Link>
        </li>
        <li>Stacks (TBC)</li>
      </ul>
    </Container>
  );
};
