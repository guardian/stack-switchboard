import { AutoScaling } from "aws-sdk";

export interface Stack {
  StackName: string;
}

export interface DesiredTags {
  stack: string;
  stage: string;
  cloudformationName: string;
}

export interface EnrichedAutoScalingGroup {
  group: AutoScaling.AutoScalingGroup;
  tags: DesiredTags;
}
