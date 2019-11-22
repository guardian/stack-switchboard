import express from "express";
import awsServerlessExpress from "aws-serverless-express";
import path from "path";
import bodyParser from "body-parser";

import { fetchSwitchboardData } from "./utils/switchboardBuilder";
import { EnrichedAutoScalingGroup } from "./utils/interfaces";
import { spinDownAutoScalingGroup } from "./utils/asgController";
import AWS, { AutoScaling } from "aws-sdk";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "/build")));

// TODO: Work out what to put instead of 'any'
export const handler = (event: any, context: any) =>
  awsServerlessExpress.proxy(
    awsServerlessExpress.createServer(app),
    event,
    context
  );

app.get("/api/", async (req, res) => {
  res.json({});
});

app.post("/api/scaledown", async (req, res) => {
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
    success = await spinDownAutoScalingGroup(
      autoScaling,
      group.AutoScalingGroupName,
      { min, desired, max }
    );
  } catch (err) {
    console.error(err);
    success = false;
  }
  res.json({
    success,
    reqBody: {
      body: req.body
    }
  });
});

app.post("/api/scaleup", async (req, res) => {
  res.json({
    scaleup: true
  });
});

app.get("/api/switchboard", async (req, res) => {
  let groups: EnrichedAutoScalingGroup[];
  try {
    groups = await fetchSwitchboardData();
  } catch (err) {
    console.error(err);
    groups = [];
  }

  res.json({ groups });
});

app.get("/api/*", async (req, res) => {
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
