import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: async (req, res) => {
    try {
      const levels = await prisma.level_Member.findMany();
      res.status(200).json(levels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch levels" });
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
