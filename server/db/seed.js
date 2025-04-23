// Clear and repopulate the database.
const { prisma } = require("./index.js")

const { faker } = require("@faker-js/faker");

async function seed() {
  console.log("Seeding the database.");
  try {
    // Add 5 instructors.
    await Promise.all(
      [...Array(5)].map(() =>
        prisma.instructor.create({
          data: {
            username: faker.internet.userName(),
            password: faker.internet.password()
          }
        })
      )
    );

    // Add 4 students for each instructor.
    await Promise.all(
      [...Array(20)].map((_, i) =>
        prisma.student.create({
          data: {
            name: faker.person.fullName(),
            cohort: faker.number.int({ min: 2000, max: 3000 }).toString(),
            instructorId: (i % 5) + 1
          }
        })
      )
    )

    console.log("Database is seeded.");
  } catch (err) {
    console.error(err);
  }
}
''
// Seed the database if we are running this file directly.
if (require.main === module) {
  seed();
}

module.exports = seed;
