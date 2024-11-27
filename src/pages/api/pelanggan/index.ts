import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  "GET" | "POST" | "PUT" | "DELETE",
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req, res) => {
    try {
      const customers = await prisma.pelanggan.findMany({
        include: {
          levelMember: { // Include nama level member
            select: { name: true },
          },
        },
      });

      res.status(200).json(customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  },

  POST: async (req, res) => {
    const { name, points } = req.body;
    if (!name || points === undefined) {
      return res.status(400).json({ error: "Name and points are required" });
    }

    try {
      // Validasi: Cek apakah nama pelanggan sudah ada
      const existingCustomer = await prisma.pelanggan.findFirst({
        where: {
          name,
          deletedAt: null,
        },
      });

      if (existingCustomer) {
        return res.status(409).json({ error: "Nama pelanggan harus unik." });
      }

      const newCustomer = await prisma.pelanggan.create({
        data: { name, points },
      });
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer" });
    }
  },

  PUT: async (req, res) => {
    const { pelanggan_id, name, points } = req.body;
    if (!pelanggan_id || !name || points === undefined) {
      return res.status(400).json({ error: "Pelanggan ID, name, and points are required" });
    }

    try {
      // Validasi: Cek apakah nama pelanggan sudah digunakan oleh pelanggan lain
      const existingCustomer = await prisma.pelanggan.findFirst({
        where: {
          name,
          deletedAt: null,
          NOT: {
            pelanggan_id, // Pastikan pelanggan ini bukan pelanggan yang sedang diperbarui
          },
        },
      });

      if (existingCustomer) {
        return res.status(409).json({ error: "Nama pelanggan harus unik." });
      }

      const updatedCustomer = await prisma.pelanggan.update({
        where: { pelanggan_id },
        data: { name, points },
      });
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  },

  DELETE: async (req, res) => {
    const { pelanggan_id } = req.body;
    if (!pelanggan_id) {
      return res.status(400).json({ error: "Pelanggan ID is required" });
    }
    try {
      const customerExists = await prisma.pelanggan.findUnique({
        where: { pelanggan_id },
      });
      if (!customerExists) {
        return res.status(404).json({ error: "Customer not found" });
      }

      await prisma.pelanggan.update({
        where: { pelanggan_id },
        data: { deletedAt: new Date() },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
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
