import express from "express";
import awsServerlessExpress from "aws-serverless-express";
import path from "path";
import { fetchSwitchboardData } from "./utils/switchboardBuilder";
import { EnrichedAutoScalingGroup } from "./utils/interfaces";

const app = express();

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "/prod/build")));

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
  res.json({
    scaleup: false
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
  res.sendFile(path.join(__dirname + "/prod/build/index.html"));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Stack-switchboard backend listening on port ${port}!`);
  });
}
