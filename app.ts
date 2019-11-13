import express from "express";
import awsServerlessExpress from "aws-serverless-express";
import { Handler } from "aws-lambda";
import path from "path";

const app = express();

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => {
  res.render("index", { title: "Hey", message: "Hello there!" });
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
