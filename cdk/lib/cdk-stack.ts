import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import s3 = require("@aws-cdk/aws-s3");

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deployBucket = s3.Bucket.fromBucketName(
      this,
      "stack-switchboard",
      "stack-switchboard"
    );

    const stackParameter = new cdk.CfnParameter(this, "stack", {
      type: "String",
      description: "Stack"
    });

    const stageParameter = new cdk.CfnParameter(this, "stage", {
      type: "String",
      description: "Stage"
    });

    new lambda.Function(this, "stack-switchboard-dev", {
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromBucket(
        deployBucket,
        `${stackParameter.valueAsString}/${stageParameter.valueAsString}/backend/backend.zip`
      ),
      description: ""
    });
  }
}
