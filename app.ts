import express from "express";
import awsServerlessExpress from "aws-serverless-express";
import { Handler } from "aws-lambda";

const app = express();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

export const handler: Handler = (event, context) => {
  awsServerlessExpress.proxy(
    awsServerlessExpress.createServer(app),
    event,
    context
  );
};

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Stack-switchboard backend listening on port ${port}!`);
    console.log(
      "Stack-switchboard backend endpoints list available at root path"
    );
  });
}
