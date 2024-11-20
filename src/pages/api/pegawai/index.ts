import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods : Record<
"GET" | "POST" | "PUT" | "DELETE",
(req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const pegawai = await prisma.pegawai.findMany({
            include: { role: true },
          });
          res.status(200).json(
            pegawai.map((p) => ({
              ...p,
              role_name: p.role.name, // Include nama role
            }))
          );
      res.status(200).json(pegawai);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pegawai" });
    }
  },
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, username, password, role_id } = req.body;
    try {
      const newPegawai = await prisma.pegawai.create({
        data: { name, username, password, role_id },
      });
      res.status(201).json(newPegawai);
    } catch (error) {
      res.status(500).json({ error: "Failed to create pegawai" });
    }
  },
  PUT: async (req: NextApiRequest, res: NextApiResponse) => {
    const { pegawai_id, name, username, password, role_id } = req.body;
    try {
      const updatedPegawai = await prisma.pegawai.update({
        where: { pegawai_id },
        data: { name, username, password, role_id },
      });
      res.status(200).json(updatedPegawai);
    } catch (error) {
      res.status(500).json({ error: "Failed to update pegawai" });
    }
  },
  DELETE: async (req, res) => {
    const { pegawai_id } = req.body;
    try {
      const pegawaiExits = await prisma.pegawai.findUnique({ where: { pegawai_id } });
      if (!pegawaiExits) {
        return res.status(404).json({ error: "Pegawai not found" });
      }
  
      await prisma.pegawai.update({
        where: { pegawai_id },
        data: { deletedAt: new Date() },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete Pegawai" });
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
  
