import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import AutoScaling from "aws-sdk/clients/autoscaling";
import Spinner from "react-bootstrap/Spinner";

const getTagValue = (group: AutoScaling.AutoScalingGroup, key: string) => {
  return group.Tags ? group.Tags.filter(t => t.Key === key)[0].Value : "";
};

const assessAlive = (group: AutoScaling.AutoScalingGroup): boolean => {
  return group.MinSize > 0;
};

interface TableRowProps {
  groupProp: AutoScaling.AutoScalingGroup;
}

function scaleButton(
  group: AutoScaling.AutoScalingGroup,
  scale: (min: number, desired: number, max: number) => void
) {
  return assessAlive(group) ? (
    <Button variant={"danger"} onClick={() => scale(0, 0, 0)}>
      Scale down
    </Button>
  ) : (
    <Button variant={"success"} onClick={() => scale(3, 3, 6)}>
      Scale up
    </Button>
  );
}

function aliveStatusColour(group: AutoScaling.AutoScalingGroup) {
  return assessAlive(group) ? "lightgreen" : "palevioletred";
}

function loadingSpinner() {
  return <Spinner animation="border" />;
}

export const TableRow = ({ groupProp }: TableRowProps) => {
  const [group, setGroup] = useState(groupProp);
  const [loading, setLoading] = useState(false);

  const scale = (min: number, desired: number, max: number) => {
    console.log("Scaling to: ", min, desired, max);
    // insert AWS stuff here

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setGroup({ ...group, MinSize: min });
    }, 2000);

    console.log(group.MinSize);
  };

  return (
    <tr key={group.AutoScalingGroupName}>
      <td style={{ width: "10%" }}>
        {loading ? loadingSpinner() : scaleButton(group, scale)}
      </td>
      <td>{getTagValue(group, "Stack")}</td>
      <td>{getTagValue(group, "Stage")}</td>
      <td>{group.AutoScalingGroupName}</td>
      <td>{group.MinSize}</td>
      <td>{group.DesiredCapacity}</td>
      <td>{group.MaxSize}</td>
      <td>
        <div style={{ color: aliveStatusColour(group) }}>
          {assessAlive(group) ? "Yes" : "No"}
        </div>
      </td>
    </tr>
  );
};
