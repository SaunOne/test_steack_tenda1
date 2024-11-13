import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req, res) => {
    try {
      const menus = await prisma.menu.findMany();
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menus", details: error });
    }
  },
  POST: async (req, res) => {
    const { nama_menu, deskripsi_menu, harga, stok_menu } = req.body;
    if (
      !nama_menu ||
      !deskripsi_menu ||
      harga === undefined ||
      stok_menu === undefined
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    try {
      const newMenu = await prisma.menu.create({
        data: {
          nama_menu,
          deskripsi_menu,
          harga: parseFloat(harga),
          stok_menu: parseInt(stok_menu),
        },
      });
      res.status(201).json(newMenu);
    } catch (error) {
      res.status(500).json({ error: "Failed to create menu", details: error });
    }
  },
  PUT: async (req, res) => {
    const { menu_id, nama_menu, deskripsi_menu, harga, stok_menu } = req.body;
    if (!menu_id) {
      res.status(400).json({ error: "Missing menu_id" });
      return;
    }
    try {
      const updatedMenu = await prisma.menu.update({
        where: { menu_id },
        data: {
          nama_menu,
          deskripsi_menu,
          harga: parseFloat(harga),
          stok_menu: parseInt(stok_menu),
        },
      });
      res.status(200).json(updatedMenu);
    } catch (error) {
      res.status(500).json({ error: "Failed to update menu", details: error });
    }
  },
  DELETE: async (req, res) => {
    const { menu_id } = req.body;
    if (!menu_id) {
      res.status(400).json({ error: "Missing menu_id" });
      return;
    }
    try {
      await prisma.menu.delete({
        where: { menu_id },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete menu", details: error });
    }
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const methodHandler = methods[req.method || ""];
  if (methodHandler) {
    await methodHandler(req, res);
  } else {
    res.setHeader("Allow", Object.keys(methods));
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
