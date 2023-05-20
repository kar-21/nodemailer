const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

const auth = {
  type: "gmail",
  user: process.env.EMAIL,
  pass: process.env.PASS,
};

app.post("/send", async (req, res, next) => {
  const mailOptions = {
    from: req.body.sender,
    to: process.env.RECEIVER_EMAIL,
    subject: `${req.body.name} [${req.body.sender}] | Saw your website. Need to talk`,
    html: `Hello Karthik,<br /><br />${req.body.message}<br /><br />Thank you,<br />${req.body.name}`,
    headers: {
      "x-priority": "1",
      "x-msmail-priority": "High",
      importance: "high",
    },
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: auth,
  });

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log("Error >" + err);
      res.status(500).send(err);
    } else {
      console.log("Email sent successfully");
      res.status(200).send({ status: "Email sent" });
    }
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const port = process.env.PORT || 5000;

app.listen(port);

module.exports = app;
