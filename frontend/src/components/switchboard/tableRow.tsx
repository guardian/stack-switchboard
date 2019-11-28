import React, { useState } from "react";
import { AutoScalingGroup } from "aws-sdk/clients/autoscaling";
import Spinner from "react-bootstrap/Spinner";

import { CustomModal } from "../customModal";
import { ScaleButton } from "./scaleButton";
import { API_ENDPOINTS } from "../../utils/values";
import { StateRow } from "./stateCell";

interface TableRowProps {
  groupProp: AutoScalingGroup;
}

const tdStyle = {
  verticalAlign: "middle"
};

const getTagValue = (group: AutoScalingGroup, key: string) => {
  return group.Tags ? group.Tags.filter(t => t.Key === key)[0].Value : "";
};

const assessAlive = (group: AutoScalingGroup): boolean => {
  return group.MinSize > 0;
};

const LoadingSpinner = () => {
  return <Spinner animation="border" />;
};

const StyledTD = ({
  id,
  children
}: {
  id: string;
  children: string | undefined;
}) => (
  <td id={id} style={tdStyle}>
    {children}
  </td>
);

export const TableRow = ({ groupProp }: TableRowProps) => {
  const [group, setGroup] = useState(groupProp);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", message: "" });

  function setErrorState() {
    setLoading(false);
    setShowModal(true);
    setConfirmed(false);
    setModalData({
      title: "Scaling Error",
      message: `There was a problem with your request, please try again`
    });
  }

  function setSuccessState(min: number, max: number, desired: number) {
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
      setErrorState();
    } else {
      setSuccessState(min, max, desired);
    }
  };

  return (
    <tr id="switch" key={group.AutoScalingGroupName}>
      {showModal ? <CustomModal data={modalData} /> : <></>}
      <td style={{ width: "10%", verticalAlign: "middle" }}>
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
      <StyledTD id="asg-name">{group.AutoScalingGroupName}</StyledTD>
      <StyledTD id="stack">{getTagValue(group, "Stack")}</StyledTD>
      <StyledTD id="stage">{getTagValue(group, "Stage")}</StyledTD>
      <StyledTD id="app">{getTagValue(group, "App")}</StyledTD>
      <StateRow assessAlive={assessAlive} group={group} />
    </tr>
  );
};
