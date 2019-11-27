import React from "react";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import Button from "react-bootstrap/Button";

export const CustomModal = ({
  data
}: {
  data: {
    title: string;
    message: string;
  };
}) => {
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  return (
    <Modal show={show} onHide={handleClose} style={{ color: "black" }}>
      <Modal.Header closeButton>
        <Modal.Title>{data.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{data.message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
