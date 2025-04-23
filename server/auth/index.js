const router = require("express").Router();
const { prisma } = require("../db");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "1234";

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    req.userId = id;
    next();
  } catch (error) {
    next(error);
  }
};

const setToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "8h" });
};

// Register a new instructor account
router.post("/register", async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.username;

    const response = await prisma.instructor.create({
      data: {
        username,
        password,
      },
    });

    // Create a token with the instructor id
    const token = setToken(response.id);

    res.status(201).send({ token });
  } catch (error) {
    res.status(409).json({
      message: "username is already taken",
    });
  }
});

// Login to an existing instructor account
router.post("/login", async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const response = await prisma.instructor.findFirst({
      where: {
        username,
      },
    });

    if (password == response.password) {
      // Create a token with the instructor id
      const token = setToken(response.id);

      res.status(200).json({ token });
    } else {
      res.status(401).json({
        message: "invalid email and/or password",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get the currently logged in instructor
router.get("/me", isLoggedIn, async (req, res, next) => {
  try {
    res.status(200).json({ id: req.userId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
