import AWS, { AutoScaling } from "aws-sdk";
import { EnrichedAutoScalingGroup, Stack } from "./interfaces";

const params = {
  region: "eu-west-1"
};

function alphabeticallyByName(
  a: EnrichedAutoScalingGroup,
  b: EnrichedAutoScalingGroup
): number {
  const groupA: string = a.name.toLowerCase();
  const groupB: string = b.name.toLowerCase();
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

const getDesiredTags = (tags: AutoScaling.Tag[], desired: string[]) => {
  const selectedTags = tags
    .filter(tag => desired.includes(tag.Key))
    .filter(hasValue);

  let obj: any = {};
  desired.map(desiredTag => {
    const tagValue: AutoScaling.Tag[] = selectedTags.filter(
      tag => tag.Key === desiredTag
    );
    obj[desiredTag] =
      tagValue.length > 0 && tagValue[0].Value ? tagValue[0].Value : "";
  });
  return obj;
};

export const fetchSwitchboardData = async () => {
  const desiredTags = ["Stack", "Stage", "aws:cloudformation:stack-name"];
  const groupWhitelist = ["flexible", "Flexible"];

  const autoscalingGroups: AutoScaling.AutoScalingGroup[] = await fns.getAutoScalingGroupState();
  return autoscalingGroups
    .filter(desiredGroups(groupWhitelist, "CODE"))
    .map(group => {
      return {
        group,
        name: group.AutoScalingGroupName,
        tags: getDesiredTags(group.Tags as AutoScaling.Tags, desiredTags)
      };
    })
    .sort(alphabeticallyByName);
};

const fns = {
  alphabeticallyByStackName: alphabeticallyByName,
  desiredGroups,
  getDesiredTags,
  fetchSwitchboardData,
  getAutoScalingGroupState
};

module.exports = fns;
