import AWS, { AutoScaling } from "aws-sdk";

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

const spinDownAutoScalingGroup = async (
  autoScalingClient: AutoScaling,
  AutoScalingGroupName: string,
  DesiredAmounts: { min: number; desired: number; max: number }
): Promise<boolean> => {
  function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  await timeout(3000);
  console.log("would spin down ", AutoScalingGroupName, DesiredAmounts);
  return true;

  // const result = await autoScalingClient.setDesiredCapacity({
  //   AutoScalingGroupName,
  //   DesiredCapacity
  // });
  // console.log(result);
};

export { spinDownAutoScalingGroup, getAutoScalingGroupState };
