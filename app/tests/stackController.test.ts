import { Tag } from "aws-cdk/lib/api/cxapp/stacks";

const stackController = require("../utils/stackController");

describe("alphabeticallyByName", function() {
  test("Should sort array by name", () => {
    const arr = [
      { name: "zzz", tags: [] },
      { name: "aaa", tags: [] },
      { name: "ccc", tags: [] }
    ];

    expect(arr.sort(stackController.alphabeticallyByStackName)).toEqual([
      { name: "aaa", tags: [] },
      { name: "ccc", tags: [] },
      { name: "zzz", tags: [] }
    ]);
  });

  test("works with capitalized and uncapitalized", () => {
    const arr = [
      { name: "zzz", tags: [] },
      { name: "GGG", tags: [] },
      { name: "bbb", tags: [] },
      { name: "aaa", tags: [] },
      { name: "ccc", tags: [] }
    ];

    expect(arr.sort(stackController.alphabeticallyByStackName)).toEqual([
      { name: "aaa", tags: [] },
      { name: "bbb", tags: [] },
      { name: "ccc", tags: [] },
      { name: "GGG", tags: [] },
      { name: "zzz", tags: [] }
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

    expect(arr.filter(stackController.desiredGroups(["thing A"]))).toEqual([
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

    expect(
      arr.filter(stackController.desiredGroups(["thing A"], ["CODE"]))
    ).toEqual([{ AutoScalingGroupName: "thing A-CODE", foo: 1 }]);
  });

  test("can filter by multiple params and stages", () => {
    const arr = [
      { AutoScalingGroupName: "thing A-CODE", foo: 1 },
      { AutoScalingGroupName: "thing A-PROD", foo: 2 },
      { AutoScalingGroupName: "thing B-CODE", foo: 1345 },
      { AutoScalingGroupName: "thing B-TEST" }
    ];

    expect(
      arr.filter(
        stackController.desiredGroups(["thing A", "thing B"], ["CODE"])
      )
    ).toEqual([
      { AutoScalingGroupName: "thing A-CODE", foo: 1 },
      { AutoScalingGroupName: "thing B-CODE", foo: 1345 }
    ]);
  });
});

describe("desiredTags", function() {
  test("creates a useful object of desired tags", () => {
    const rawTags: Tag[] = [
      { Key: "undesired-tag", Value: "some-tag-value" },
      { Key: "tag1", Value: "some-stage-value" },
      { Key: "tag2", Value: "some-stack-value" },
      {
        Key: "alsoDesired",
        Value: "some-cloudformation-value"
      }
    ];

    const desired = ["tag1", "tag2", "alsoDesired"];

    expect(stackController.getDesiredTags(rawTags, desired)).toEqual({
      tag1: "some-stage-value",
      tag2: "some-stack-value",
      alsoDesired: "some-cloudformation-value"
    });
  });

  test("works if tag is missing", () => {
    const arr: Tag[] = [
      { Key: "undesired-tag", Value: "some-tag-value" },
      { Key: "tag1", Value: "some-stage-value" },
      { Key: "tag2", Value: "some-stack-value" }
    ];

    const desired = ["tag1", "tag2", "someMissingTag"];

    expect(stackController.getDesiredTags(arr, desired)).toEqual({
      tag1: "some-stage-value",
      tag2: "some-stack-value",
      someMissingTag: ""
    });
  });
});

describe("fetchSwitchboardData", () => {
  test("transforms data successfully for switchboard", async () => {
    const dummyAutoscalingGroups = [
      {
        AutoScalingGroupName: "flexible-CODE",
        Tags: [
          { Key: "Stage", Value: "CODE" },
          { Key: "Stack", Value: "flexible" },
          { Key: "aws:cloudformation:stack-name", Value: "foobar" }
        ]
      },
      {
        AutoScalingGroupName: "flexible-CODE-2",
        Tags: [
          { Key: "Stage", Value: "CODE" },
          { Key: "Stack", Value: "flexible" },
          { Key: "aws:cloudformation:stack-name", Value: "foobar" }
        ]
      },
      {
        AutoScalingGroupName: "flexible-CODE-3",
        Tags: [
          { Key: "Stage", Value: "CODE" },
          { Key: "Stack", Value: "flexible" },
          { Key: "aws:cloudformation:stack-name", Value: "foobar" }
        ]
      }
    ];
    stackController.getAutoScalingGroupState = jest.fn(
      () => dummyAutoscalingGroups
    );
    expect(await stackController.fetchSwitchboardData()).toEqual([
      {
        name: "flexible-CODE",

        group: {
          AutoScalingGroupName: "flexible-CODE",
          Tags: [
            { Key: "Stage", Value: "CODE" },
            { Key: "Stack", Value: "flexible" },
            { Key: "aws:cloudformation:stack-name", Value: "foobar" }
          ]
        },
        tags: {
          Stack: "flexible",
          Stage: "CODE",
          "aws:cloudformation:stack-name": "foobar"
        }
      },
      {
        name: "flexible-CODE-2",
        group: {
          AutoScalingGroupName: "flexible-CODE-2",
          Tags: [
            { Key: "Stage", Value: "CODE" },
            { Key: "Stack", Value: "flexible" },
            { Key: "aws:cloudformation:stack-name", Value: "foobar" }
          ]
        },
        tags: {
          Stack: "flexible",
          Stage: "CODE",
          "aws:cloudformation:stack-name": "foobar"
        }
      },
      {
        name: "flexible-CODE-3",
        group: {
          AutoScalingGroupName: "flexible-CODE-3",
          Tags: [
            { Key: "Stage", Value: "CODE" },
            { Key: "Stack", Value: "flexible" },
            { Key: "aws:cloudformation:stack-name", Value: "foobar" }
          ]
        },
        tags: {
          Stack: "flexible",
          Stage: "CODE",
          "aws:cloudformation:stack-name": "foobar"
        }
      }
    ]);
  });
});
