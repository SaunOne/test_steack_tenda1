import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req, res) => {
    try {
      const pelanggan = await prisma.pelanggan.findMany({
        include: { level_member: true },
      });
      res.status(200).json(pelanggan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pelanggan" });
    }
  },
  POST: async (req, res) => {
    const { nama_pelanggan, level_id } = req.body;
    try {
      const newPelanggan = await prisma.pelanggan.create({
        data: { nama_pelanggan, level_id },
      });
      res.status(201).json(newPelanggan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create pelanggan" });
    }
  },
  PUT: async (req, res) => {
    const { pelanggan_id, nama_pelanggan, level_id } = req.body;
    try {
      const updatedPelanggan = await prisma.pelanggan.update({
        where: { pelanggan_id },
        data: { nama_pelanggan, level_id },
      });
      res.status(200).json(updatedPelanggan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update pelanggan" });
    }
  },
  DELETE: async (req, res) => {
    const { pelanggan_id } = req.body;
    try {
      await prisma.pelanggan.delete({
        where: { pelanggan_id },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete pelanggan" });
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
