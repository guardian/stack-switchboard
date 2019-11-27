import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";

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
          <Link component={Nav.Link} to={"/switchboard"}>
            Switchboard
          </Link>
          <Link component={Nav.Link} to={"/centralproduction"}>
            Central Production
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
