// An instructor can only access their own students' data.
const router = require("express").Router();
const { prisma } = require("../db");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "1234";

// Deny access if user is not logged in
const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    req.userId = id;
    next();
  } catch (error) {
    return res.status(401).send("You must be logged in to do that.");
  }
};

// Get all students
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const instructorId = req.userId;
    const response = await prisma.student.findMany({
      where: {
        instructorId,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get a student by id
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const instructorId = req.userId;
    console.log("instructorId: ", instructorId);
    const response = await prisma.student.findFirst({
      where: {
        id,
        instructorId,
      },
    });

    if (!response) {
      return res.status(404).send("Student not found.");
    }

    res.send(response);
  } catch (error) {
    next(error);
  }
});

// Create a new student
router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const name = req.body.name;
    const cohort = req.body.cohort;
    const instructorId = req.userId;

    const response = await prisma.student.create({
      data: {
        name,
        cohort,
        instructorId,
      },
    });

    res.status(201).send(response);
  } catch (error) {
    return res.status(400).send("Invalid JSON format.");
  }
});

// Update a student
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const name = req.body.name;
    const cohort = req.body.cohort;
    const instructorId = req.userId;

    const response = await prisma.student.update({
      where: {
        id,
        instructorId,
      },
      data: {
        name,
        cohort,
      },
    });

    res.send(response);
  } catch (error) {
    return res.status(404).send("Student not found.");
  }
});

// Delete a student by id
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const instructorId = req.userId;

    const response = await prisma.student.delete({
      where: {
        id,
        instructorId,
      },
    });

    res.send(response);
  } catch (error) {
    return res.status(404).send("Student not found.");
  }
});

module.exports = router;
