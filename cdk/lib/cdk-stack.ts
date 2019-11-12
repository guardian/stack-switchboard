import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, "stack-switchboard-dev", {
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("../dist"),
      description: ""
    });
  }
}
