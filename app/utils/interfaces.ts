import { CloudFormation } from "aws-sdk";

export interface Stack {
  StackName: string;
}

export interface StackResources {
  stack: {
    StackName: string;
    description: string;
    driftStatus: string;
  };
  autoscaling: {
    desired: number;
    max: number;
    min: number;
  };
  resources: CloudFormation.StackResourceSummary[];
}

export interface AutoScalingGroupInfo extends StackResources {
  autoScalingGroupName: string;
  MinSize: number;
  DesiredCapacity: number;
  MaxSize: number;
}
