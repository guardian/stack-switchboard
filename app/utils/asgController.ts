import { AutoScaling } from "aws-sdk";

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

const spinDownAutoScalingGroup = (
  autoScalingClient: AutoScaling,
  AutoScalingGroupName: string,
  DesiredCapacity: number
) => {
  return autoScalingClient.setDesiredCapacity({
    AutoScalingGroupName,
    DesiredCapacity
  });
};

export { spinDownAutoScalingGroup, getAutoScalingGroupState };
