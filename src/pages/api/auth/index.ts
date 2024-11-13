import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const methods: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  POST: async (req, res) => {
    const { username, password } = req.body;
    console.log("req.body", req.body);
    try {
    const pegawai = await prisma.pegawai.findUnique({
      where: { username },
    });
    if (!pegawai) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // const isPasswordCorrect = password === pegawai.password;

    // if (!isPasswordCorrect) {
    //   return res.status(401).json({ error: "Invalid username or password" });
    // }

    if(password !== pegawai.password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // const token = jwt.sign(
    //   {
    //     pegawai_id: pegawai.pegawai_id,
    //     nama: pegawai.nama,
    //     akses_menu: pegawai.akses_menu,
    //   },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "1h" }
    // );
    
    res.status(200).json({
      message: "Login successful",
      pegawai: {
        pegawai_id: pegawai.pegawai_id,
        nama: pegawai.nama,
        akses_menu: pegawai.akses_menu,
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
