const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const uploadBase64File = require("./utils/uploadFileDrive.js");

require("dotenv").config({ path: ".env" });

const port = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.post("/uploadFile", async (req, res) => {
  try {
    let imageUri = await uploadBase64File(req.body.base64);
    res
      .status(200)
      .json({ success: true, message: "Success!", data: { imageUri } });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

app.listen(port, () => console.log("Listening on " + port));
