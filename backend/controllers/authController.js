const User = require("../models/User");
const jwt = require("jsonwebtoken");

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateAnonymousHandle() {
  const adjectives = [
    "silver",
    "golden",
    "swift",
    "quiet",
    "brave",
    "lucky",
    "mellow",
    "bright",
    "wild",
    "gentle",
    "clever",
    "sunny",
  ];

  const nouns = [
    "starfish",
    "otter",
    "sparrow",
    "panther",
    "fox",
    "owl",
    "tiger",
    "koala",
    "dolphin",
    "falcon",
    "badger",
    "lynx",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 90) + 10;

  return `@${capitalize(adj)}${capitalize(noun)}${number}`;
}

async function signup(req, res) {
  try {
    console.log("Incoming Request Body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    let anonymousHandle = null;

    for (let i = 0; i < 5; i++) {
      const candidate = generateAnonymousHandle();
      const handleExists = await User.exists({ anonymousHandle: candidate });

      if (!handleExists) {
        anonymousHandle = candidate;
        break;
      }
    }

    if (!anonymousHandle) {
      return res
        .status(500)
        .json({ message: "Could not generate anonymous handle" });
    }

    const user = await User.create({
      email: normalizedEmail,
      password: String(password),
      anonymousHandle,
    });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      anonymousHandle: user.anonymousHandle,
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Duplicate key error" });
    }

    return res.status(500).json({ message: "Server error" });
  }
}

async function signin(req, res) {
  try {
    console.log("Incoming Request Body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET not configured" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      anonymousHandle: user.anonymousHandle,
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  signup,
  signin,
};
