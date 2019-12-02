import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import s3 = require("@aws-cdk/aws-s3");
import iam = require("@aws-cdk/aws-iam");
import apigateway = require("@aws-cdk/aws-apigateway");
import { Duration } from "@aws-cdk/core";
import { AnyPrincipal, Effect, PolicyStatement } from "@aws-cdk/aws-iam";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const officeIP = "77.91.248.0/21";

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

    const switchboardLambda = new lambda.Function(
      this,
      "stack-switchboard-dev",
      {
        functionName: `stack-switchboard-${stageParameter.valueAsString}`,
        handler: "index.handler",
        runtime: lambda.Runtime.NODEJS_10_X,
        code: lambda.Code.fromBucket(
          deployBucket,
          `${stackParameter.valueAsString}/${stageParameter.valueAsString}/switchboard/switchboard.zip`
        ),
        description: "Switchboard for controlling CODE & secondary resources",
        timeout: Duration.seconds(15),
        memorySize: 512
      }
    );

    const statement = new iam.PolicyStatement();
    statement.addActions("autoscaling:*");
    statement.addResources("*");

    switchboardLambda.addToRolePolicy(statement);

    const allowOfficeIPs: PolicyStatement = new iam.PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ["execute-api:Invoke"],
      resources: [`execute-api:/*/*/*`],
      conditions: { IpAddress: { "aws:SourceIp": [officeIP] } }
    });

    const denyAllOtherIPs: PolicyStatement = new iam.PolicyStatement({
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      actions: ["execute-api:Invoke"],
      resources: [`execute-api:/*/*/*`]
    });

    new apigateway.LambdaRestApi(this, "stack-switchboard-api", {
      handler: switchboardLambda,
      description: `API for stack-switchboard lambda in ${stageParameter.valueAsString} env`,
      policy: new iam.PolicyDocument({
        statements: [allowOfficeIPs, denyAllOtherIPs]
      })
    });
  }
}
