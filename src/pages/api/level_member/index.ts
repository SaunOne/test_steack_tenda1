import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  "GET" | "POST" | "PUT" | "DELETE",
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req, res) => {
    try {
      const levels = await prisma.levelMember.findMany({
        where: { deletedAt: null }, // Exclude soft-deleted records
      });
      res.status(200).json(levels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch levels" });
    }
  },
  POST: async (req, res) => {
    const { name, diskon, minimum_point } = req.body;
    if (!name || typeof diskon !== "number" || typeof minimum_point !== "number") {
      return res.status(400).json({ error: "Invalid input data" });
    }
    try {
      const newLevel = await prisma.levelMember.create({
        data: { name, diskon, minimum_point },
      });
      res.status(201).json(newLevel);
    } catch (error) {
      res.status(500).json({ error: "Failed to create level" });
    }
  },
  PUT: async (req, res) => {
    const { level_member_id, name, diskon, minimum_point } = req.body;
    if (!level_member_id || !name || typeof diskon !== "number" || typeof minimum_point !== "number") {
      return res.status(400).json({ error: "Invalid input data" });
    }
    try {
      const updatedLevel = await prisma.levelMember.update({
        where: { level_member_id },
        data: { name, diskon, minimum_point },
      });
      res.status(200).json(updatedLevel);
    } catch (error) {
      res.status(500).json({ error: "Failed to update level" });
    }
  },
  DELETE: async (req, res) => {
    const { level_member_id } = req.body;
    if (!level_member_id) {
      return res.status(400).json({ error: "Level ID is required" });
    }
    try {
      // Soft delete by setting `deletedAt` to current timestamp
      await prisma.levelMember.update({
        where: { level_member_id },
        data: { deletedAt: new Date() },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete level" });
    }
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const methodHandler = methods[req.method as keyof typeof methods];
  if (methodHandler) {
    await methodHandler(req, res);
  } else {
    res.setHeader("Allow", Object.keys(methods));
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
