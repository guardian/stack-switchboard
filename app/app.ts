import express from "express";
import awsServerlessExpress from "aws-serverless-express";
import path from "path";
import bodyParser from "body-parser";

import { fetchSwitchboardData } from "./utils/switchboardBuilder";
import { EnrichedAutoScalingGroup } from "./utils/interfaces";
import { scaleAutoScalingGroup } from "./utils/asgController";
import AWS, { AutoScaling } from "aws-sdk";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const endpointPrefix = process.env.NODE_ENV === "development" ? "/prod" : "";

app.use(express.static(path.join(__dirname, "/build")));

// TODO: Work out what to put instead of 'any'
export const handler = (event: any, context: any) =>
  awsServerlessExpress.proxy(
    awsServerlessExpress.createServer(app),
    event,
    context
  );

app.get(`${endpointPrefix}/api/`, async (req, res) => {
  res.json({});
});

app.post(`${endpointPrefix}/api/scale`, async (req, res) => {
  let success: boolean;
  const {
    min,
    max,
    desired,
    group
  }: {
    min: number;
    max: number;
    desired: number;
    group: AutoScaling.AutoScalingGroup;
  } = req.body;

  const params = {
    region: "eu-west-1"
  };

  const autoScaling = new AWS.AutoScaling(params);

  try {
    success = await scaleAutoScalingGroup(
      autoScaling,
      group.AutoScalingGroupName,
      { min, desired, max }
    );
  } catch (err) {
    console.error(err);
    success = false;
  }
  res.json({ success });
});

app.get(`${endpointPrefix}/api/switchboard`, async (req, res) => {
  let groups: EnrichedAutoScalingGroup[];
  try {
    groups = await fetchSwitchboardData();
    res.json({ groups });
  } catch (err) {
    console.error(err);
    groups = [];
    res.status(401);
    res.json({ groups });
  }
});

app.get(`${endpointPrefix}/api/*`, async (req, res) => {
  res.json({ api: true });
});

app.get("/*", (req, res) => {
  res.type("html");
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Stack-switchboard backend listening on port ${port}!`);
  });
}
