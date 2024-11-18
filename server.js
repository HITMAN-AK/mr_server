const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Um = require("./Um");
const User = require("./User");
const Mn = require("./Mn");
const { spawn } = require("child_process");
const password = encodeURIComponent("Ashwin@01012004");
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
main().catch((err) => {
  console.log(err);
});
async function main() {
  await mongoose
    .connect(
      `mongodb+srv://legendaryairforce:${password}@mrdb.expdex1.mongodb.net/mrdb`
    )
    .then(() => {
      console.log("db connect success");
    })
    .catch((err) => {
      console.log("db connect error", err);
    });
}
app.post("/np", async (req, res) => {
  const uname = await User.findOne({ uname: req.body.uname });
  await User.updateOne({ _id: uname }, { pass: req.body.np }).then(() => {
    res.json({ status: true });
  });
});
app.post("/cus", async (req, res) => {
  const uname = await User.findOne({ uname: req.body.uname });
  if (uname != null) {
    if (uname.scode == req.body.sc) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } else {
    res.json({ status: false });
  }
});
app.post("/rm", async (req, res) => {
  const user = await Um.findOne({ uname: req.body.uname });
  if (user != null) {
    await Um.updateOne(
      { uname: req.body.uname },
      { $pull: { ml: req.body.mov } }
    );
    return res.json({ status: true });
  }
  res.json({ status: false });
});
app.post("/tl", async (req, res) => {
  const user = await Um.findOne({ uname: req.body.uname });
  if (user != null) {
    return res.json({ status: true, mov: user.ml });
  }
  res.json({ status: false });
});
app.post("/am", async (req, res) => {
  const mov = req.body.mov;
  const uname = req.body.uname;
  const movArray = Array.isArray(mov) ? mov : [mov];
  const user = await Um.findOne({ uname: uname });
  if (user) {
    await Um.updateOne(
      { uname: uname },
      { $push: { ml: { $each: movArray } } }
    );
  } else {
    await Um.create({
      uname: uname,
      ml: movArray,
    });
  }
  res.json({ status: true });
});
app.post("/gm", async (req, res) => {
  const user = await Um.findOne({ uname: req.body.uname });
  const mov = req.body.title;
  const ma = await Mn.findOne({ Title: mov });
  if (ma === null) {
    return res.json({ status: false });
  }
  const pythonProcess = spawn("python", ["mr.py", mov]);
  let stdout = "";
  let stderr = "";
  pythonProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });
  pythonProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });
  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      console.error(`Python script stderr: ${stderr}`);
      return res.json({ status: false });
    }
    let recommendations = [];
    const result = {};
    try {
      recommendations = JSON.parse(stdout);
      recommendations.forEach((movie) => {
        result[movie] = user.ml.includes(movie);
      });
    } catch (parseError) {
      console.error(`Error parsing Python script output: ${parseError}`);
      return res.json({ status: false });
    }
    console.log(`Recommendations: ${recommendations}`);
    return res.json({ status: true, ml: result });
  });
});
app.post("/mn", async (req, res) => {
  const n = await Mn.find();
  const mid = [];
  n.forEach((v) => {
    mid.push({
      id: v._id,
      title: v.Title,
    });
  });
  mid.sort((a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
  });
  res.json({ mov: mid });
});
app.post("/cu", async (req, res) => {
  const ua = await User.exists({ uname: req.body.uname });
  if (ua === null) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
});
app.post("/signup", async (req, res) => {
  const name = req.body.name;
  const uname = req.body.uname;
  const pass = req.body.pass;
  const sc = Math.floor(Math.random() * 10000000);
  const ua = await User.exists({ uname: req.body.uname });
  if (ua === null) {
    await User.create({
      name: name,
      uname: uname,
      pass: pass,
      scode: sc,
    }).then(() => {
      res.json({ status: true });
    });
  } else {
    res.json({ status: false });
  }
});
app.post("/log", async (req, res) => {
  const uname = await User.exists({ uname: req.body.uname });
  const pass = await User.where({ uname: req.body.uname }).select("pass");
  if (uname != null && pass[0].pass === req.body.pass) {
    const x = Math.floor(Math.random() * 10000000000);
    const uuid = await User.where({ uname: req.body.uname }).select("uuid");
    await User.updateOne({ _id: uuid }, { uuid: x });
    res.json({ status: true, uuid: x });
  } else {
    res.json({ status: false });
  }
});
app.post("/pr", async (req, res) => {
  const uname = req.body.uname;
  const uuid = req.body.uuid;
  console.log(uname, uuid);
  if (uname != null && uuid != null) {
    const ud = await User.where({ uname: uname }).select("uuid");
    if (ud[0].uuid == uuid) {
      return res.json({ per: true });
    } else {
      return res.json({ per: false });
    }
  }
  res.json({ per: false });
});
app.listen(1000, "0.0.0.0", () => {
  console.log(`Server running on port`);
});
