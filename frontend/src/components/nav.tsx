import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

const CustomNav = () => {
  return (
    <Navbar bg="dark" variant={"dark"} expand="sm">
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Brand href="/">Stack Switchboard</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/switchboard">Switchboard</Nav.Link>
          <Nav.Link href="/centralproduction">Central Production</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNav;
