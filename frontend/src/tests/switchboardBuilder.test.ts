import { Tag } from "aws-cdk/lib/api/cxapp/stacks";

const stackController = require("../utils/switchboardBuilder");
const asgController = require("../utils/asgController");

describe("alphabeticallyByName", function() {
  test("Should sort array by name", () => {
    const arr = [
      { name: "zzz", tags: [] },
      { name: "aaa", tags: [] },
      { name: "ccc", tags: [] }
    ];

    expect(arr.sort(stackController.alphabeticallyByName)).toEqual([
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

    expect(arr.sort(stackController.alphabeticallyByName)).toEqual([
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
  beforeEach(() => {
    const dummyAutoscalingGroups = [
      exampleASGItem("flexible-CODE", "CODE", "flexible", "cfName1"),
      exampleASGItem("flexible-CODE-2", "CODE", "flexible", "cfName2"),
      exampleASGItem("flexible-CODE-3", "CODE", "flexible", "cfName3")
    ];

    asgController.getAutoScalingGroupState = jest.fn(
      () => dummyAutoscalingGroups
    );
  });

  test("transforms data successfully for switchboard", async () => {
    const dummyAutoscalingGroups = [
      exampleASGItem("flexible-CODE", "CODE", "flexible", "cfName1"),
      exampleASGItem("flexible-CODE-2", "CODE", "flexible", "cfName2"),
      exampleASGItem("flexible-CODE-3", "CODE", "flexible", "cfName3")
    ];

    asgController.getAutoScalingGroupState = jest.fn(
      () => dummyAutoscalingGroups
    );

    expect(await stackController.fetchSwitchboardData()).toEqual([
      desiredASGItem("flexible-CODE", "CODE", "flexible", "cfName1"),
      desiredASGItem("flexible-CODE-2", "CODE", "flexible", "cfName2"),
      desiredASGItem("flexible-CODE-3", "CODE", "flexible", "cfName3")
    ]);
  });

  test("ignores items that are not relevant", async () => {
    const dummyAutoscalingGroups = [
      exampleASGItem("flexible-CODE", "CODE", "flexible", "cfName1"),
      exampleASGItem("flexible-CODE-2", "CODE", "flexible", "cfName2"),
      exampleASGItem("flexible-CODE-4", "CODE", "flexible", "cfName4"),
      exampleASGItem("unwanted-PROD-thing", "CODE", "blah", "some-cf-name")
    ];

    asgController.getAutoScalingGroupState = jest.fn(
      () => dummyAutoscalingGroups
    );

    expect(await stackController.fetchSwitchboardData()).toEqual([
      desiredASGItem("flexible-CODE", "CODE", "flexible", "cfName1"),
      desiredASGItem("flexible-CODE-2", "CODE", "flexible", "cfName2"),
      desiredASGItem("flexible-CODE-4", "CODE", "flexible", "cfName4")
    ]);
  });

  test("sorts by name", async () => {
    const dummyAutoscalingGroups = [
      exampleASGItem(
        "ccc-flexible-CODE",
        "CODE",
        "flexible",
        "ccc-flexible-CODE"
      ),
      exampleASGItem(
        "bbb-flexible-CODE",
        "CODE",
        "flexible",
        "bbb-flexible-CODE"
      ),
      exampleASGItem(
        "aaa-flexible-CODE",
        "CODE",
        "flexible",
        "aaa-flexible-CODE"
      )
    ];

    asgController.getAutoScalingGroupState = jest.fn(
      () => dummyAutoscalingGroups
    );

    expect(await stackController.fetchSwitchboardData()).toEqual([
      desiredASGItem(
        "aaa-flexible-CODE",
        "CODE",
        "flexible",
        "aaa-flexible-CODE"
      ),
      desiredASGItem(
        "bbb-flexible-CODE",
        "CODE",
        "flexible",
        "bbb-flexible-CODE"
      ),
      desiredASGItem(
        "ccc-flexible-CODE",
        "CODE",
        "flexible",
        "ccc-flexible-CODE"
      )
    ]);
  });
});

function exampleASGItem(
  name: string,
  stage: string,
  stack: string,
  cloudformationName: string
) {
  return {
    AutoScalingGroupName: name,
    Tags: [
      { Key: "Stage", Value: stage },
      { Key: "Stack", Value: stack },
      { Key: "aws:cloudformation:stack-name", Value: cloudformationName }
    ]
  };
}

function desiredASGItem(
  name: string,
  stage: string,
  stack: string,
  cloudformationName: string
) {
  return {
    name: name,
    group: {
      AutoScalingGroupName: name,
      Tags: [
        { Key: "Stage", Value: stage },
        { Key: "Stack", Value: stack },
        { Key: "aws:cloudformation:stack-name", Value: cloudformationName }
      ]
    },
    tags: {
      Stack: stack,
      Stage: stage,
      "aws:cloudformation:stack-name": cloudformationName
    }
  };
}
