import AWS from "aws-sdk";

const params = {
  region: "eu-west-1"
};

const cloudFormation = new AWS.CloudFormation(params);

interface Stack {
  StackName: String;
}

function byStackName(a: Stack, b: Stack) {
  const stackA: String = a.StackName.toLowerCase();
  const stackB: String = b.StackName.toLowerCase();
  if (stackA < stackB) {
    return -1;
  } else if (stackA > stackB) {
    return 1;
  }
  return 0;
}

function nonProdStacks() {
  return (stack: Stack) =>
    stack.StackName.includes("CODE") ||
    stack.StackName.includes("DEV") ||
    stack.StackName.includes("TEST");
}

const queryCloudFormation = async (NextToken?: string) => {
  return await cloudFormation
    .listStacks({ NextToken })
    .promise()
    .then(data => {
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

export const getStacks = async () => {
  let stacks: Stack[] = [];
  let response = await queryCloudFormation().then(async res => res);
  stacks = stacks.concat(response.stacks);
  while (response.NextToken) {
    response = await queryCloudFormation(response.NextToken).then(res => res);
    stacks = stacks.concat(response.stacks);
  }
  return stacks.filter(nonProdStacks()).sort(byStackName);
};
