import React from "react";
import { AutoScalingGroup } from "aws-sdk/clients/autoscaling";
import Button from "react-bootstrap/Button";

export const ScaleButton = ({
  group,
  confirm,
  scale,
  assessAlive
}: {
  group: AutoScalingGroup;
  confirm: boolean;
  scale: (min: number, desired: number, max: number) => void;
  assessAlive: Function;
}) => {
  let variant: "success" | "warning", onCLick, text;

  if (assessAlive(group)) {
    variant = "warning";
    onCLick = () => scale(0, 0, 0);
    text = "Scale down";
  } else {
    variant = "success";
    onCLick = () => scale(3, 3, 6);
    text = "Scale up";
  }

  return (
    <Button variant={confirm ? `danger` : variant} onClick={onCLick}>
      {confirm ? "Are you sure?" : text}
    </Button>
  );
};
