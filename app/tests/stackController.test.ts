import { Tag } from "aws-cdk/lib/api/cxapp/stacks";

const {
  alphabeticallyByStackName,
  desiredGroups,
  getDesiredTags
} = require("../utils/stackController");

describe("alphabeticallyByStackName", function() {
  test("Should sort array by AutoScalingGroupName", () => {
    const arr = [
      { group: { AutoScalingGroupName: "zzz" }, tags: [] },
      { group: { AutoScalingGroupName: "aaa" }, tags: [] },
      { group: { AutoScalingGroupName: "ccc" }, tags: [] }
    ];

    expect(arr.sort(alphabeticallyByStackName)).toEqual([
      { group: { AutoScalingGroupName: "aaa" }, tags: [] },
      { group: { AutoScalingGroupName: "ccc" }, tags: [] },
      { group: { AutoScalingGroupName: "zzz" }, tags: [] }
    ]);
  });

  test("works with capitalized and uncapitalized", () => {
    const arr = [
      { group: { AutoScalingGroupName: "zzz" }, tags: [] },
      { group: { AutoScalingGroupName: "GGG" }, tags: [] },
      { group: { AutoScalingGroupName: "bbb" }, tags: [] },
      { group: { AutoScalingGroupName: "aaa" }, tags: [] },
      { group: { AutoScalingGroupName: "ccc" }, tags: [] }
    ];

    expect(arr.sort(alphabeticallyByStackName)).toEqual([
      { group: { AutoScalingGroupName: "aaa" }, tags: [] },
      { group: { AutoScalingGroupName: "bbb" }, tags: [] },
      { group: { AutoScalingGroupName: "ccc" }, tags: [] },
      { group: { AutoScalingGroupName: "GGG" }, tags: [] },
      { group: { AutoScalingGroupName: "zzz" }, tags: [] }
    ]);
  });
});

describe("desiredGroups", function() {
  test("should filter by parameters passed in", () => {
    const arr = [
      { AutoScalingGroupName: "thing A", foo: 1 },
      { AutoScalingGroupName: "thing A", foo: 2 },
      { AutoScalingGroupName: "thing B" }
    ];

    expect(arr.filter(desiredGroups(["thing A"]))).toEqual([
      { AutoScalingGroupName: "thing A", foo: 1 },
      { AutoScalingGroupName: "thing A", foo: 2 }
    ]);
  });

  test("should filter by stage too", () => {
    const arr = [
      { AutoScalingGroupName: "thing A-CODE", foo: 1 },
      { AutoScalingGroupName: "thing A-PROD", foo: 2 },
      { AutoScalingGroupName: "thing B-TEST" }
    ];

    expect(arr.filter(desiredGroups(["thing A"], ["CODE"]))).toEqual([
      { AutoScalingGroupName: "thing A-CODE", foo: 1 }
    ]);
  });

  test("can filter by multiple params and stages", () => {
    const arr = [
      { AutoScalingGroupName: "thing A-CODE", foo: 1 },
      { AutoScalingGroupName: "thing A-PROD", foo: 2 },
      { AutoScalingGroupName: "thing B-CODE", foo: 1345 },
      { AutoScalingGroupName: "thing B-TEST" }
    ];

    expect(arr.filter(desiredGroups(["thing A", "thing B"], ["CODE"]))).toEqual(
      [
        { AutoScalingGroupName: "thing A-CODE", foo: 1 },
        { AutoScalingGroupName: "thing B-CODE", foo: 1345 }
      ]
    );
  });
});

describe("desiredTags", function() {
  test("creates a useful object of desired tags", () => {
    const arr: Tag[] = [
      { Key: "undesired-tag", Value: "some-tag-value" },
      { Key: "tag1", Value: "some-stage-value" },
      { Key: "tag2", Value: "some-stack-value" },
      {
        Key: "alsoDesired",
        Value: "some-cloudformation-value"
      }
    ];

    const desired = ["tag1", "tag2", "alsoDesired"];

    expect(getDesiredTags(arr, desired)).toEqual({
      tag1: "some-stage-value",
      tag2: "some-stack-value",
      alsoDesired: "some-cloudformation-value"
    });
  });
});
