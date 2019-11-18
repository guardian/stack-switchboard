import express from "express";
import awsServerlessExpress from "aws-serverless-express";
import path from "path";
import { fetchSwitchboardData } from "./utils/stackController";

const app = express();

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(__dirname + "/public"));

// TODO: Work out what to put instead of 'any'
export const handler = (event: any, context: any) =>
  awsServerlessExpress.proxy(
    awsServerlessExpress.createServer(app),
    event,
    context
  );

app.get("/", async (req, res) => {
  const stacks = await fetchSwitchboardData().catch(err => {
    console.error("fetchSwitchboard data broke: ", err);
    throw new Error(err);
  });
  res.render("index", {
    title: "Stack Switchboard",
    message: "Stack Switchboard",
    stacks
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Stack-switchboard backend listening on port ${port}!`);
  });
}
