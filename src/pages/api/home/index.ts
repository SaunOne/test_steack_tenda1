import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const topCustomers = await prisma.pelanggan.findMany({
      orderBy: { points: 'desc' },
      include: {
        levelMember: true
      },
      take: 5, // Ambil 5 pelanggan teratas
    });
    res.status(200).json(topCustomers);
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
}
