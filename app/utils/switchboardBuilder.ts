import AWS, { AutoScaling } from "aws-sdk";
import { EnrichedAutoScalingGroup, Stack } from "./interfaces";
import { getAutoScalingGroupState } from "./asgController";

const params = {
  region: "eu-west-1"
};

const autoScaling = new AWS.AutoScaling(params);

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
      (whitelist.length > 0
        ? whitelist.find(item => group.AutoScalingGroupName.includes(item))
        : true)
    );
}

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
  const groupWhitelist: string[] = [];

  const autoscalingGroups = await getAutoScalingGroupState(autoScaling);

  return autoscalingGroups
    .filter(desiredGroups(groupWhitelist, "CODE"))
    .map((group: AutoScaling.AutoScalingGroup) => {
      return {
        group,
        name: group.AutoScalingGroupName,
        tags: getDesiredTags(group.Tags as AutoScaling.Tags, desiredTags)
      };
    })
    .sort(alphabeticallyByName);
};

const fns = {
  alphabeticallyByName: alphabeticallyByName,
  desiredGroups,
  getDesiredTags,
  fetchSwitchboardData
};

module.exports = fns;
