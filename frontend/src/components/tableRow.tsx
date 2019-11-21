import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import AutoScaling from "aws-sdk/clients/autoscaling";

const getTagValue = (group: AutoScaling.AutoScalingGroup, key: string) => {
  return group.Tags ? group.Tags.filter(t => t.Key === key)[0].Value : "";
};

const assessAlive = (group: AutoScaling.AutoScalingGroup): boolean => {
  return group.MinSize > 0;
};

interface TableRowProps {
  groupProp: AutoScaling.AutoScalingGroup;
}

export const TableRow = ({ groupProp }: TableRowProps) => {
  const [group, setGroup] = useState(groupProp);

  const scale = (min: number, desired: number, max: number) => {
    console.log("Scaling to: ", min, desired, max);
    group.MinSize = min;
    setGroup(group);
  };

  return (
    <tr key={group.AutoScalingGroupName}>
      <td>{getTagValue(group, "Stack")}</td>
      <td>{getTagValue(group, "Stage")}</td>
      <td>{group.AutoScalingGroupName}</td>
      <td>{group.MinSize}</td>
      <td>{group.DesiredCapacity}</td>
      <td>{group.MaxSize}</td>
      <td>
        {assessAlive(group) ? (
          <div style={{ color: "lightgreen" }}>Yes!</div>
        ) : (
          <div style={{ color: "palevioletred" }}>No.</div>
        )}
      </td>
      <td>
        {assessAlive(group) ? (
          <Button variant={"warning"} onClick={() => scale(0, 0, 0)}>
            Scale down
          </Button>
        ) : (
          <Button variant={"primary"} onClick={() => scale(3, 3, 6)}>
            Scale up
          </Button>
        )}
      </td>
    </tr>
  );
};
