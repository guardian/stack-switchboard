import AWS from "aws-sdk";

const params = {
  region: "eu-west-1"
};

const cloudFormation = new AWS.CloudFormation(params);

interface Stack {
  StackName: String;
}

function compare(a: Stack, b: Stack) {
  if (a.StackName < b.StackName) {
    return -1;
  }
  if (a.StackName > b.StackName) {
    return 1;
  }
  return 0;
}

export const getStacks = async () => {
  return await cloudFormation
    .listStacks({
      StackStatusFilter: ["CREATE_COMPLETE"]
    })
    .promise()
    .then(data => {
      if (data.StackSummaries) {
        return data.StackSummaries.sort(compare);
      } else {
        throw new Error("StackSummaries missing");
      }
    })
    .catch(err => err);
};
