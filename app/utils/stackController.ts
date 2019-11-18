import AWS, { AutoScaling } from "aws-sdk";
import { DesiredTags, EnrichedAutoScalingGroup, Stack } from "./interfaces";

const params = {
  region: "eu-west-1"
};

function alphabeticallyByStackName(
  a: EnrichedAutoScalingGroup,
  b: EnrichedAutoScalingGroup
): number {
  const groupA: string = a.group.AutoScalingGroupName.toLowerCase();
  const groupB: string = b.group.AutoScalingGroupName.toLowerCase();
  if (groupA < groupB) {
    return -1;
  } else if (groupA > groupB) {
    return 1;
  }
  return 0;
}

function desiredGroups(): (group: AutoScaling.AutoScalingGroup) => boolean {
  const whitelist = ["flexible", "Flexible"];
  return group =>
    !!(
      group.AutoScalingGroupName.includes("CODE") &&
      whitelist.find(item => group.AutoScalingGroupName.includes(item))
    );
}

const getAutoScalingGroupState = async (): Promise<
  AutoScaling.AutoScalingGroup[]
> => {
  const autoScaling = new AWS.AutoScaling(params);

  return await autoScaling
    .describeAutoScalingGroups({ MaxRecords: 100 })
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

function desiredTags(tags: AutoScaling.Tags): DesiredTags {
  const selectedTags = tags
    .filter(
      tag =>
        tag.Key === "Stack" ||
        tag.Key === "Stage" ||
        tag.Key === "aws:cloudformation:stack-name"
    )
    .filter(hasValue);
  return {
    stack: selectedTags.filter(tag => tag.Key === "Stack")[0].Value,
    stage: selectedTags.filter(tag => tag.Key === "Stage")[0].Value,
    cloudformationName: selectedTags.filter(
      tag => tag.Key === "aws:cloudformation:stack-name"
    )[0].Value
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
