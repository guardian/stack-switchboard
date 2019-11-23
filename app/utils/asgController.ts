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
    .catch(err =>
      console.error(`Error in updating ASG ${AutoScalingGroupName}:`, err)
    );

  console.log(result);

  return true;
};

export { scaleAutoScalingGroup, getAutoScalingGroupState };
