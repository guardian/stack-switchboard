import AWS, { AutoScaling } from "aws-sdk";

const params = {
  region: "eu-west-1"
};

export const getAutoScalingGroupState = async (): Promise<
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

const fns = {
  getAutoScalingGroupState
};

module.exports = fns;
