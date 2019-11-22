import React, { useState } from "react";
import Button, { ButtonProps } from "react-bootstrap/Button";
import { AutoScalingGroup } from "aws-sdk/clients/autoscaling";
import Spinner from "react-bootstrap/Spinner";

import { ErrorModal } from "./errorModal";
import { ScaleButton } from "./scaleButton";
import { API_ENDPOINTS } from "../utils/values";

interface TableRowProps {
  groupProp: AutoScalingGroup;
}

const getTagValue = (group: AutoScalingGroup, key: string) => {
  return group.Tags ? group.Tags.filter(t => t.Key === key)[0].Value : "";
};

const assessAlive = (group: AutoScalingGroup): boolean => {
  return group.MinSize > 0;
};

function aliveStatusColour(group: AutoScalingGroup) {
  return assessAlive(group) ? "lightgreen" : "palevioletred";
}

const LoadingSpinner = () => {
  return <Spinner animation="border" />;
};

export const TableRow = ({ groupProp }: TableRowProps) => {
  const [group, setGroup] = useState(groupProp);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", message: "" });

  function setSuccessState() {
    setLoading(false);
    setShowModal(true);
    setConfirmed(false);
    setModalData({
      title: "Scaling Error",
      message: `There was a problem with your request, please try again`
    });
  }

  function setErrorState(min: number, max: number, desired: number) {
    setConfirmed(false);
    setLoading(false);
    setGroup({
      ...group,
      MinSize: min,
      MaxSize: max,
      DesiredCapacity: desired
    });
  }

  const scale = async (min: number, desired: number, max: number) => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setShowModal(false);
    setLoading(true);

    const response = await fetch(API_ENDPOINTS.SCALE, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ min, max, desired, group })
    });

    const result = await response.json();

    if (!result.success) {
      setSuccessState();
    } else {
      setErrorState(min, max, desired);
    }
  };

  return (
    <tr key={group.AutoScalingGroupName}>
      {showModal ? <ErrorModal data={modalData} /> : ""}
      <td style={{ width: "10%", textAlign: "center" }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ScaleButton
            group={group}
            confirm={confirmed}
            scale={scale}
            assessAlive={assessAlive}
          />
        )}
      </td>
      <td>{getTagValue(group, "Stack")}</td>
      <td>{getTagValue(group, "Stage")}</td>
      <td>{group.AutoScalingGroupName}</td>
      <td>{group.MinSize}</td>
      <td>{group.DesiredCapacity}</td>
      <td>{group.MaxSize}</td>
      <td>
        <div style={{ color: aliveStatusColour(group), fontWeight: "bold" }}>
          {assessAlive(group) ? "Yes" : "No"}
        </div>
      </td>
    </tr>
  );
};
