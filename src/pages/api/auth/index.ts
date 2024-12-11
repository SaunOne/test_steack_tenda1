import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  POST: async (req, res) => {
    const { username, password } = req.body;
    try {
      const pegawai = await prisma.pegawai.findUnique({
        where: { username },
        include: { role: true }, // Tambahkan relasi role
      });

      if (!pegawai || pegawai.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      res.status(200).json({
        message: "Login successful",
        pegawai: {
          pegawai_id: pegawai.pegawai_id,
          name: pegawai.name,
          role: pegawai.role.name, // Sertakan role name
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
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
