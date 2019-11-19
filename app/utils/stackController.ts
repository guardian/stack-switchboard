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

function desiredGroups(
  whitelist: string[],
  stage?: string
): (group: AutoScaling.AutoScalingGroup) => boolean {
  return group =>
    !!(
      group.AutoScalingGroupName.includes(stage || "") &&
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

const getDesiredTags = (
  tags: AutoScaling.Tag[],
  desired: string[]
): DesiredTags => {
  const selectedTags = tags
    .filter(tag => desired.includes(tag.Key))
    .filter(hasValue);

  let obj: any = {};
  desired.map(
    desiredTag =>
      (obj[desiredTag] = selectedTags.filter(
        tag => tag.Key === desiredTag
      )[0].Value)
  );
  return obj;
};

export const fetchSwitchboardData = async () => {
  const desiredTags = ["Stack", "Stage", "aws:cloudformation:stack-name"];
  const autoscalingWhitelist = ["flexible", "Flexible"];

  const autoscalingGroups = await getAutoScalingGroupState();
  return autoscalingGroups
    .filter(desiredGroups(autoscalingWhitelist, "CODE"))
    .map((group: AutoScaling.AutoScalingGroup) => {
      return {
        group,
        tags: getDesiredTags(group.Tags as AutoScaling.Tags, desiredTags)
      };
    })
    .sort(alphabeticallyByStackName);
};

module.exports = {
  alphabeticallyByStackName,
  desiredGroups,
  getDesiredTags,
  fetchSwitchboardData
};
