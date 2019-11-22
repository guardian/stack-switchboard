import { AutoScaling } from "aws-sdk";

interface ASGState {
  min: number;
  desired: number;
  max: number;
}

const getAutoScalingGroupState = async (
  autoScalingClient: AutoScaling
): Promise<AutoScaling.AutoScalingGroup[]> => {
  return await autoScalingClient
    .describeAutoScalingGroups({ MaxRecords: 100 })
    .promise()
    .then(
      (response: AutoScaling.AutoScalingGroupsType) =>
        response.AutoScalingGroups
    );
};

const scaleAutoScalingGroup = async (
  autoScalingClient: AutoScaling,
  AutoScalingGroupName: string,
  { min, max, desired }: ASGState
): Promise<boolean> => {
  if (
    AutoScalingGroupName ===
    "Flexible-Apps-Secondary-CODE-ComposerAutoscalingGroup-1IGJ3K04CQSLJ"
  ) {
    console.log(
      `Scaling [${AutoScalingGroupName}] to [min: ${min}, desired: ${desired}, max: ${max}]`
    );
    const result = await autoScalingClient
      .updateAutoScalingGroup({
        AutoScalingGroupName,
        DesiredCapacity: desired,
        MinSize: min,
        MaxSize: max
      })
      .promise()
      .catch(err => console.error("Error:", err));
    console.log(result);
  } else {
    console.log("would spin down ", AutoScalingGroupName, {
      min,
      max,
      desired
    });
    return false;
  }
  return true;
};

export { scaleAutoScalingGroup, getAutoScalingGroupState };
