import AWS, { AutoScaling } from "aws-sdk";
import { Stack } from "./interfaces";

const params = {
  region: "eu-west-1"
};

function byStackName(
  a: AutoScaling.AutoScalingGroup,
  b: AutoScaling.AutoScalingGroup
): number {
  const groupA: string = a.AutoScalingGroupName.toLowerCase();
  const groupB: string = b.AutoScalingGroupName.toLowerCase();
  if (groupA < groupB) {
    return -1;
  } else if (groupA > groupB) {
    return 1;
  }
  return 0;
}

function desiredGroups(): (group: AutoScaling.AutoScalingGroup) => boolean {
  return (group: AutoScaling.AutoScalingGroup) =>
    (group.AutoScalingGroupName.includes("flexible") ||
      group.AutoScalingGroupName.includes("Flexible")) &&
    group.AutoScalingGroupName.includes("CODE");
}

const getAutoScalingGroupState = async (): Promise<
  AutoScaling.AutoScalingGroup[]
> => {
  const autoScaling = new AWS.AutoScaling(params);

  return await autoScaling
    .describeAutoScalingGroups({})
    .promise()
    .then(
      (response: AutoScaling.AutoScalingGroupsType) =>
        response.AutoScalingGroups
    )
    .catch(err => {
      console.error(err);
      return err;
    });
};

export const fetchSwitchboardData = async () => {
  const autoscalingGroups: AutoScaling.AutoScalingGroup[] = await getAutoScalingGroupState()
    .then((groups: AutoScaling.AutoScalingGroup[]) =>
      groups.filter(desiredGroups).sort(byStackName)
    )
    .catch(err => {
      throw new Error(err);
    });
  console.log(autoscalingGroups.length);
  return autoscalingGroups;
};

module.exports = { fetchSwitchboardData };
