import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    // Get all level members
    case "GET":
      try {
        const levelMembers =
          (await prisma.levelMember.findMany({
            where: { deletedAt: null },
          })) || [];
        return res.status(200).json(levelMembers);
      } catch (error) {
        console.error("Failed to fetch level members:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    // Create a new level member
    case "POST":
      try {
        const { name, diskon, minimum_point } = req.body;

        // Validate inputs
        if (!name || diskon === undefined || minimum_point === undefined) {
          return res.status(400).json({ message: "All fields are required." });
        }
        if (diskon < 0 || diskon > 100) {
          return res
            .status(400)
            .json({ message: "Diskon must be between 0 and 100." });
        }
        if (minimum_point < 0) {
          return res
            .status(400)
            .json({ message: "Minimum point cannot be negative." });
        }

        const newLevelMember = await prisma.levelMember.create({
          data: { name, diskon, minimum_point },
        });
        return res.status(201).json(newLevelMember);
      } catch (error) {
        console.error("Failed to create level member:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    // Update an existing level member
    case "PUT":
      try {
        const { level_member_id, name, diskon, minimum_point } = req.body;

        // Validate inputs
        if (
          !level_member_id ||
          !name ||
          diskon === undefined ||
          minimum_point === undefined
        ) {
          return res.status(400).json({ message: "All fields are required." });
        }
        if (diskon < 0 || diskon > 100) {
          return res
            .status(400)
            .json({ message: "Diskon must be between 0 and 100." });
        }
        if (minimum_point < 0) {
          return res
            .status(400)
            .json({ message: "Minimum point cannot be negative." });
        }

        const updatedLevelMember = await prisma.levelMember.update({
          where: { level_member_id },
          data: { name, diskon, minimum_point },
        });
        return res.status(200).json(updatedLevelMember);
      } catch (error) {
        console.error("Failed to update level member:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    // Soft delete a level member
    case "DELETE":
      try {
        const { level_member_id } = req.body;

        // Validate input
        if (!level_member_id) {
          return res
            .status(400)
            .json({ message: "Level member ID is required." });
        }

        await prisma.levelMember.update({
          where: { level_member_id },
          data: { deletedAt: new Date() },
        });
        return res
          .status(200)
          .json({ message: "Level member deleted successfully." });
      } catch (error) {
        console.error("Failed to delete level member:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    // Handle unsupported methods
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).json({ message: `Method ${method} not allowed.` });
  }
}
