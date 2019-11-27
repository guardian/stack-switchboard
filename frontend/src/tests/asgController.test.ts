const stuff = require("../utils/asgController");

class MockRequest {
  fn: Function;

  constructor(fn: Function) {
    this.fn = fn;
  }

  promise() {
    return new Promise(resolve => resolve(this.fn()));
  }
}

describe("getAutoScalingGroupState", () => {
  test("it works", async () => {
    const awsClientMock = {
      describeAutoScalingGroups: jest.fn(() => {
        return new MockRequest(() => {
          return { AutoScalingGroups: ["foo", "bar"] };
        });
      })
    };
    const result = await stuff.getAutoScalingGroupState(awsClientMock);
    expect(awsClientMock.describeAutoScalingGroups).toHaveBeenCalled();
    expect(result).toEqual(["foo", "bar"]);
  });
});

describe("spinDownAutoScalingGroup", () => {
  xtest("it works", () => {
    const awsClientMock = {
      setDesiredCapacity: jest.fn(() => {
        return new MockRequest(() => {
          return { AutoScalingGroups: ["foo", "bar"] };
        });
      })
    };
    expect(stuff.spinDownAutoScalingGroup(awsClientMock)).toEqual("foo");
  });
});
