import { AutoScaling } from "aws-sdk";

export interface Stack {
  StackName: string;
}

export interface EnrichedAutoScalingGroup {
  group: AutoScaling.AutoScalingGroup;
  name: string;
  tags: {};
}
