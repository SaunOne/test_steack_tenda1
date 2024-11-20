// // prisma/seed.ts
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   await prisma.pegawai.create({
//     data: {
//       nama: "John Doe",
//       akses_menu: "admin",
//       username: "johndoe",
//       password: "password123", // Plaintext password for testing only
//     },
//   });
//   console.log("Dummy pegawai created!");

//   await prisma.level_Member.createMany({
//     data: [
//       { level_id: 1, nama_level: "Bronze", minimal_point: 100 },
//       { level_id: 2, nama_level: "Silver", minimal_point: 500 },
//       { level_id: 3, nama_level: "Gold", minimal_point: 1000 },
//       { level_id: 4, nama_level: "Platinum", minimal_point: 2000 },
//       { level_id: 5, nama_level: "Diamond", minimal_point: 5000 },
//     ],
//     skipDuplicates: true, // To avoid duplicate entries if you run the seed multiple times
//   });

//   console.log("Level_Member data seeded successfully!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
