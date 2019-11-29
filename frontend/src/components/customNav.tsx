import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import {CLIENT_ENDPOINTS} from "../utils/values";

export const CustomNav = () => {
  return (
    <Navbar bg="dark" variant={"dark"} expand="sm">
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Brand href="/">Stack Switchboard</Navbar.Brand>
        <Nav className="mr-auto">
          <Link component={Nav.Link} to={"/"}>
            Home
          </Link>
          <Link component={Nav.Link} to={CLIENT_ENDPOINTS.SWITCHBOARD}>
            Autoscaling Groups
          </Link>
          <Link component={Nav.Link} to={"/stacks"}>
            Stacks
          </Link>
          <Link component={Nav.Link} to={CLIENT_ENDPOINTS.CENTRAL_PROD}>
            Central Production
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
