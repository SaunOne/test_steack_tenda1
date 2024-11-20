import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  "GET" | "POST" | "PUT" | "DELETE",
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const roles = await prisma.role.findMany({
        where: { deletedAt: null },
      });
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  },

  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Role name is required" });
    }
    try {
      const newRole = await prisma.role.create({
        data: { name },
      });
      res.status(201).json(newRole);
    } catch (error) {
      res.status(500).json({ error: "Failed to create role" });
    }
  },

  PUT: async (req: NextApiRequest, res: NextApiResponse) => {
    const { role_id, name } = req.body;
    if (!role_id || !name) {
      return res.status(400).json({ error: "Role ID and name are required" });
    }
    try {
      const updatedRole = await prisma.role.update({
        where: { role_id },
        data: { name },
      });
      res.status(200).json(updatedRole);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  },

  DELETE: async (req: NextApiRequest, res: NextApiResponse) => {
    const { role_id } = req.body;
    if (!role_id) {
      return res.status(400).json({ error: "Role ID is required" });
    }
    try {
      const roleExists = await prisma.role.findUnique({
        where: { role_id },
      });
      if (!roleExists) {
        return res.status(404).json({ error: "Role not found" });
      }

      await prisma.role.update({
        where: { role_id },
        data: { deletedAt: new Date() },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodHandler = methods[req.method as "GET" | "POST" | "PUT" | "DELETE"];
  if (methodHandler) {
    await methodHandler(req, res);
  } else {
    res.setHeader("Allow", Object.keys(methods));
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
