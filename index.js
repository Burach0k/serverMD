const fs = require("fs");
const PORT = process.env.PORT || 5000;
const express = require("express");
const app = express();
const http = require("http");
const server = http.Server(app);
const bodyparser = require("body-parser");
const session = require("express-session");
const fetch = require("node-fetch");
let cors = require("cors");
const uuid1 = require("uuid/v1");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const readline = require("readline");
const { google } = require("googleapis");
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/activity"
];
const TOKEN_PATH = "token.json";
const joinDownloadFiles = require("./contain/script");
const request = require("request");
const mentor_score_id = "18exMEOWGKsMPggt0t3yU-MR1gvX3OFBDqKCvdNy8rAU";
const tasks_id = "1uojrkWfoLh9oTKxLWCdirrNJYGVfCtiF9RlZrwsxSbo";
const mentor_students_pairs_id = "1-HYzpnEYpIsv5qSSuSZCgKf5-mYnG0T3Xt864Hhdnew";
let auth;
require("dotenv").config();

let auth_token_for_current_user;

mongoose.connect(
  "mongodb://meUser:1234wwe@ds149885.mlab.com:49885/sessions",
  { useNewUrlParser: true }
);

function watchGoogleDrive(callback) {
  let watch = {
    method: "POST",
    url: `https://www.googleapis.com/drive/v3/files/${mentor_score_id}/${tasks_id}/${mentor_students_pairs_id}/watch`,
    headers: {
      Authorization: "Bearer " + auth_token_for_current_user,
      "Content-Type": "application/json"
    },
    body: {
      id: uuid1(),
      type: "web_hook",
      address: "https://mentormew.herokuapp.com/"
    },
    json: true
  };

  request(watch, function(error, response, body) {
    callback();
  });
}

fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  authorize(JSON.parse(content));
});

/**
  @param {Object} credentials 
  @param {function} callback
 */

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  auth = oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    auth_token_for_current_user = oAuth2Client.credentials.access_token;
  });
}

/**
  @param {google.auth.OAuth2} oAuth2Client 
  @param {getEventsCallback} callback 
 */

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
}

/**
 @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function listFiles(auth) {
  let currentSuccessfulRequest = 0;
  console;
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth });
    drive.files.list(
      {
        pageSize: 10,
        fields: "nextPageToken, files(id, name)"
      },
      (err, res) => {
        if (err) return reject(new Error("The API returned an error: " + err));
      }
    );

    const file_mentor_score = fs.createWriteStream("data/Mentor-score.xlsx");

    drive.files.export(
      {
        fileId: mentor_score_id,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      { responseType: "stream" },
      (res, req) => {
        req.data
          .on("end", () => {
            if (++currentSuccessfulRequest === 3) resolve();
          })
          .on("error", function(err) {
            reject(new Error("Error during download", err));
          })
          .pipe(file_mentor_score);
      }
    );

    const file_mentor_students_pairs = fs.createWriteStream(
      "data/Mentor-students-pairs.xlsx"
    );
    drive.files.export(
      {
        fileId: mentor_students_pairs_id,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      { responseType: "stream" },
      (res, req) => {
        req.data
          .on("end", () => {
            if (++currentSuccessfulRequest === 3) resolve();
          })
          .on("error", function(err) {
            reject(new Error("Error during download", err));
          })
          .pipe(file_mentor_students_pairs);
      }
    );

    const file_tasks = fs.createWriteStream("data/Tasks.xlsx");

    drive.files.export(
      {
        fileId: tasks_id,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      { responseType: "stream" },
      (res, req) => {
        req.data
          .on("end", () => {
            if (++currentSuccessfulRequest === 3) resolve();
          })
          .on("error", function(err) {
            reject(new Error("Error during download", err));
          })
          .pipe(file_tasks);
      }
    );
  });
}

function promisifyJoinDownloadFiles() {
  return new Promise((resolve, reject) => {
    joinDownloadFiles();
    resolve();
  });
}

function pushFiles() {
  let data = fs.readFileSync("data.json");
  let sha;
  var getSha = {
    method: "GET",
    url:
      "https://api.github.com/repos/Burach0k/mentorDashboard/contents/data.json",
    headers: {
      "User-Agent": "TEST",
      authorization: "Basic QnVyYWNoMGs6cHIwa2FjaGth"
    },
    body: {
      branch: "gh-pages",
      name: "Burach0k",
      email: "Burak_andrej@mail.ru"
    },
    json: true
  };

  request(getSha, function(error, response, body) {
    if (error) throw new Error(error);
    sha = body.sha;
    var options = {
      method: "PUT",
      url:
        "https://api.github.com/repos/Burach0k/mentorDashboard/contents/data.json",
      headers: {
        "User-Agent": "TEST",
        authorization: "Basic QnVyYWNoMGs6cHIwa2FjaGth"
      },
      body: {
        branch: "gh-pages",
        message: "my message",
        sha: sha,
        committer: { name: "Burach0k", email: "Burak_andrej@mail.ru" },
        content: Buffer.from(data).toString("base64")
      },
      json: true
    };

    request(options, function(error, response, body) {
      if (error) throw new Error(error);
    });
  });
}

app.use(cors());
app.use(bodyparser.json());
app.use(
  session({
    genid: req => uuid1(),
    secret: process.env.CLIENT_SECRET,
    name: "id_session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

const io = require("socket.io")(server);

app.route("/login").get((req, res) => {
  let { code } = req.query;

  res.sendStatus(200);
  fetch(
    `https://github.com/login/oauth/access_token?client_id=${
      process.env.CLIENT_ID
    }&client_secret=${process.env.CLIENT_SECRET}&code=${code}`
  )
    .then(res => res.text())
    .then(obj => fetch(`https://api.github.com/user?${obj}`))
    .then(res => res.json())
    .then(obj => {
      req.session.name = obj.login;
      req.session.idSocket;
      req.session.save();
      io.in(req.session.idSocket).emit("sendResult", obj.login);
    });
});

app.get("/register", function(req, res) {
  if (req.session.name) {
    io.in(req.query.socket_id).emit("sendResult", req.session.name);
  } else {
    req.session.idSocket = req.query.socket_id;
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${
        process.env.CLIENT_ID
      }`
    );
  }
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/watch", function(req, res) {
  watchGoogleDrive(() => {
    listFiles(auth)
      .then(() => promisifyJoinDownloadFiles())
      .then(() => pushFiles());
  });
  res.sendStatus(200);
});

server.listen(PORT);
