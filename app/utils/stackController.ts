import AWS, { CloudFormation, AutoScaling } from "aws-sdk";
import { ListStackResourcesOutput } from "aws-sdk/clients/cloudformation";
import { AutoScalingGroupInfo, Stack, StackResources } from "./interfaces";

const params = {
  region: "eu-west-1"
};

const cloudFormation = new AWS.CloudFormation(params);

function byStackName(a: Stack, b: Stack): number {
  const stackA: string = a.StackName.toLowerCase();
  const stackB: string = b.StackName.toLowerCase();
  if (stackA < stackB) {
    return -1;
  } else if (stackA > stackB) {
    return 1;
  }
  return 0;
}

function desiredStacks(): (stack: Stack) => boolean {
  return (stack: Stack) =>
    (stack.StackName.includes("flexible") ||
      stack.StackName.includes("Flexible")) &&
    stack.StackName.includes("CODE");
}

const queryCloudFormation = async (
  NextToken?: string
): Promise<{ stacks: CloudFormation.StackSummaries; NextToken: string }> => {
  return await cloudFormation
    .listStacks({ NextToken })
    .promise()
    .then((data: CloudFormation.ListStacksOutput) => {
      if (data.StackSummaries) {
        return {
          stacks: data.StackSummaries,
          NextToken: data.NextToken
        };
      } else {
        throw Error("StackSummaries missing");
      }
    })
    .catch(err => err);
};

const getStackResources = async (stack: Stack): Promise<StackResources> => {
  return await cloudFormation
    .listStackResources({ StackName: stack.StackName })
    .promise()
    .then((resources: ListStackResourcesOutput) => {
      if (resources.StackResourceSummaries) {
        return {
          stack,
          resources: resources.StackResourceSummaries.filter(resource =>
            resource.ResourceType.includes("AWS::AutoScaling::AutoScalingGroup")
          )
        };
      } else {
        return {
          stack,
          resources: []
        };
      }
    })
    .catch(err => err);
};

const getAutoScalingGroupState = async (
  autoScalingGroupName: string
): Promise<AutoScalingGroupInfo> => {
  const autoScaling = new AWS.AutoScaling(params);

  return await autoScaling
    .describeAutoScalingGroups({
      AutoScalingGroupNames: [autoScalingGroupName]
    })
    .promise()
    .then((response: AutoScaling.AutoScalingGroupsType) => {
      const {
        MinSize,
        DesiredCapacity,
        MaxSize
      } = response.AutoScalingGroups[0];
      return { autoScalingGroupName, MinSize, DesiredCapacity, MaxSize };
      //     return `${autoScalingGroupName}:
      // Min: ${response.AutoScalingGroups[0].MinSize},
      // Desired: ${response.AutoScalingGroups[0].DesiredCapacity},
      // Max: ${response.AutoScalingGroups[0].MaxSize}`;
    })
    .catch(err => err);
};

async function fetchAllStacks(): Promise<Stack[]> {
  let stacks: Stack[] = [];
  let response: {
    stacks: CloudFormation.StackSummaries;
    NextToken: string;
  } = await queryCloudFormation().then(async res => res);
  stacks = stacks.concat(response.stacks);
  while (response.NextToken) {
    response = await queryCloudFormation(response.NextToken).then(res => res);
    stacks = stacks.concat(response.stacks);
  }
  return stacks;
}

export const fetchSwitchboardData = async () => {
  let stacks = await fetchAllStacks();

  const usefulStacks = stacks.filter(desiredStacks()).sort(byStackName);

  let enrichedStacks: StackResources[] = [];
  for (let stack of usefulStacks) {
    let result: StackResources = await getStackResources(stack);
    enrichedStacks.push(result);
  }

  let stacksWithASGInfo: any[] = [];
  for (let stackWithResources of enrichedStacks) {
    console.log(`\n******* ${stackWithResources.stack.StackName} ********`);
    if (
      stackWithResources.resources.length > 0 &&
      stackWithResources.resources[0].PhysicalResourceId
    ) {
      console.log(`[${stackWithResources.resources.length}] resources found`);
      let fullyBuiltStackWithASGInformation = Object.assign(
        stackWithResources,
        { autoScalingGroups: <AutoScalingGroupInfo[]>[] }
      );

      for (let resource of stackWithResources.resources) {
        if (resource.PhysicalResourceId) {
          const stateInfo: AutoScalingGroupInfo = await getAutoScalingGroupState(
            resource.PhysicalResourceId
          );
          fullyBuiltStackWithASGInformation.autoScalingGroups.push(stateInfo);
          console.log(stateInfo);

          stacksWithASGInfo.push(fullyBuiltStackWithASGInformation);
        }
      }
    } else {
      console.log(`${stackWithResources.stack.StackName} does not have an ASG`);
    }
  }
  return stacksWithASGInfo;
};

module.exports = { fetchSwitchboardData };
