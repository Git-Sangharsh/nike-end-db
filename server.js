import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { config as dotenvConfig } from "dotenv";

dotenvConfig(); // Loading environment variables from the .env file
const envUserName = process.env.MONGODB_USERNAME;
const envPassWord = process.env.MONGODB_PASSWORD;

const server = express();
server.use(bodyParser.json());
server.use(cors());

mongoose
  .connect(
    `mongodb+srv://${envUserName}:${envPassWord}@mainnikedb.jx4pwkk.mongodb.net/yourdatabasename`
  )
  .then(() => console.log("mongodb connected"))
  .catch((error) => {
    console.log("mongodb error: ", error);
  });

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("signin", userSchema);

//creating schema for registration schema

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      //this can throw an error remember
      // unique: true
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//creating model for registration schema
const Register = mongoose.model("register", registrationSchema);

//creating a unique index on the 'username' field
// Register.collection.createIndex({ email: 1 }, { unique: true });
// User.collection.createIndex({ email: 1 }, { unique: true });

server.get("/", (req, res) => {
  res.send("<h1>welcome to backend of nike</h1>");
});

server.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  // Checking if the user exists in the register collection
  const registerExistUser = await Register.findOne({ email: username });

  if (registerExistUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      registerExistUser.password
    );

    if (isPasswordValid) {
      console.log("Sign in as", registerExistUser.name);
      return res
        .status(200)
        .json({ message: "success", user: registerExistUser.name });
    } else {
      console.log("Incorrect Email or Password");
      return res.status(200).json({ incorrectPass: "wrongCredentials" });
    }
  } else {
    console.log("User not found");
    return res.status(200).json({ incorrect: "userNotFound" });
  }
});

server.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const alreadyExistRegisterUser = await Register.findOne({ email: email });

    if (alreadyExistRegisterUser) {
      return res.status(200).json({ exist: "alreadyExist" });
    }

    //hashing user's password
    const saltRounds = 10; //number of salt rounds (higher is more secure but slower )
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const registerResult = await Register.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    console.log("data inserted successfully", registerResult);
    return res.status(200).json({ message: "success", signUpName: name });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json("Error inserting data");
  }
});

const port = 8080;

server.listen(port, () => {
  console.log(`server is live on port ${port}`);
});
