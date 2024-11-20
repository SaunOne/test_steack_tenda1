import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  "GET" | "POST" | "PUT" | "DELETE",
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req, res) => {
    try {
      const menu = await prisma.menu.findMany();
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu" });
    }
  },
  POST: async (req, res) => {
    const { name, description, stok, price } = req.body;
  if (!name || !description || stok === undefined || price === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const newMenu = await prisma.menu.create({
      data: { name, description, stok: stok, price: price },
    });
    res.status(201).json(newMenu);
  } catch (error) { 
    res.status(500).json({ error: "Failed to create menu" });
  }
  },
  PUT: async (req, res) => {
    const { menu_id, name, description, stok } = req.body;
    try {
      const updatedMenu = await prisma.menu.update({
        where: { menu_id },
        data: { name, description, stok },
      });
      res.status(200).json(updatedMenu);
    } catch (error) {
      res.status(500).json({ error: "Failed to update menu" });
    }
  },
  DELETE: async (req, res) => {
    const { menu_id } = req.body;
    try {
      const menuExists = await prisma.menu.findUnique({ where: { menu_id } });
      if (!menuExists) {
        return res.status(404).json({ error: "Menu not found" });
      }
  
      await prisma.menu.update({
        where: { menu_id },
        data: { deletedAt: new Date() },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete menu" });
    }
  },
  
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodHandler = methods[req.method as keyof typeof methods];
  if (methodHandler) {
    await methodHandler(req, res);
  } else {
    res.setHeader("Allow", Object.keys(methods));
    res.status(405).end(`Method ${req.method || "Unknown"} Not Allowed`);
  }
}
