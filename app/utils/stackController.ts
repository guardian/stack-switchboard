import AWS, { AutoScaling } from "aws-sdk";
import { EnrichedAutoScalingGroup, Stack } from "./interfaces";

const params = {
  region: "eu-west-1"
};

function alphabeticallyByStackName(
  a: EnrichedAutoScalingGroup,
  b: EnrichedAutoScalingGroup
): number {
  const groupA: string = a.tags.stack.toLowerCase();
  const groupB: string = b.tags.stack.toLowerCase();
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
    );
};

const hasValue = (
  tag: AutoScaling.Tag
): tag is { Key: string; Value: string } => {
  return !!tag.Value;
};

function desiredTags(tags: AutoScaling.Tags): { stack: string; stage: string } {
  const selectedTags = tags
    .filter(tag => (tag.Value && tag.Key === "Stack") || tag.Key === "Stage")
    .filter(hasValue);
  return {
    stack: selectedTags.filter(tag => tag.Key === "Stack")[0].Value,
    stage: selectedTags.filter(tag => tag.Key === "Stage")[0].Value
  };
}

export const fetchSwitchboardData = async () => {
  const autoscalingGroups = await getAutoScalingGroupState();
  return autoscalingGroups
    .filter(desiredGroups())
    .map((group: AutoScaling.AutoScalingGroup) => {
      return {
        group,
        tags: desiredTags(group.Tags as AutoScaling.Tags)
      };
    })
    .sort(alphabeticallyByStackName);
};

module.exports = { fetchSwitchboardData };
