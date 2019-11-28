import { AutoScalingGroup } from "aws-sdk/clients/autoscaling";
import Row from "react-bootstrap/Row";
import React from "react";

export const StateRow = ({
  group,
  assessAlive
}: {
  group: AutoScalingGroup;
  assessAlive: Function;
}) => {
  const stateStyle = (group: AutoScalingGroup) => {
    return { color: aliveStatusColour(group, assessAlive), width: "12vw" };
  };

  const aliveStatusColour = (
    group: AutoScalingGroup,
    assessAlive: Function
  ) => {
    return assessAlive(group) ? "lightgreen" : "palevioletred";
  };

  return (
    <td id="state" style={stateStyle(group)}>
      <Row noGutters>
        <span>
          <b>{group.MinSize}</b> Minimum
        </span>
      </Row>
      <Row noGutters>
        <span>
          <b>{group.DesiredCapacity}</b> Desired
        </span>
      </Row>
      <Row noGutters>
        <span>
          <b>{group.MaxSize}</b> Maximum
        </span>
      </Row>
    </td>
  );
};
