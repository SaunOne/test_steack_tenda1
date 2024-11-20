import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  "GET" | "POST" | "PUT" | "DELETE",
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  // Fetch all transactions
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const transactions = await prisma.transaksi.findMany({
        where: { deletedAt: null },
        include: {
          pelanggan: true,
          detail_transaksi: {
            include: { menu: true },
          },
        },
      });
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },

  // Create a new transaction
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('Isi body:', req.body);
    const { pelanggan_id, menu } = req.body;

    if (!pelanggan_id || !menu || !Array.isArray(menu)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    try {
      // Fetch pelanggan points
      const pelanggan = await prisma.pelanggan.findUnique({
        where: { pelanggan_id },
      });

      if (!pelanggan) {
        return res.status(404).json({ error: "Pelanggan not found" });
      }

      const pelangganPoints = pelanggan.points;

      // Get applicable diskon based on minimum_point descending
      const applicableDiskon = await prisma.levelMember.findFirst({
        where: { minimum_point: { lte: pelangganPoints } },
        orderBy: { minimum_point: "desc" },
      });

      console.log('Applicable diskon:', applicableDiskon?.diskon);

      const diskonId = applicableDiskon?.level_member_id || null;
      let diskonRate = applicableDiskon?.diskon || 0;
      
      // Validate diskonRate between 0 and 1
      diskonRate = ((applicableDiskon?.diskon ?? 0 * 1.0)  / 100.0)
      console.log('dikson ' , diskonRate);
      // Calculate total price
      let totalHarga = 0;
      for (const item of menu) {
        const menuItem = await prisma.menu.findUnique({
          where: { menu_id: item.id_menu },
        });

        if (!menuItem) {
          return res.status(404).json({ error: `Menu with id ${item.id_menu} not found` });
        }

        totalHarga += menuItem.price * item.amount;
      }
      console.log('ini diskon rate',diskonRate);
      // Apply discount if applicable
      const discountedTotal = totalHarga - (totalHarga * diskonRate);

      // Calculate additional points (1 point per Rp10,000) only if no diskon is applied
      const additionalPoints = diskonRate === 0 ? Math.floor(totalHarga / 10000) : 0;

      // Update pelanggan points if additional points are earned
      if (additionalPoints > 0) {
        await prisma.pelanggan.update({
          where: { pelanggan_id },
          data: { points: pelanggan.points + additionalPoints },
        });
      }

      // Create transaksi
      const newTransaksi = await prisma.transaksi.create({
        data: {
          pelanggan_id,
          diskon_id: diskonId,
          tanggal_transaksi: new Date(),
          total_harga: discountedTotal,
        },
      });

      // Create detail transaksi
      for (const item of menu) {
        await prisma.detailTransaksi.create({
          data: {
            transaksi_id: newTransaksi.transaksi_id,
            menu_id: item.id_menu,
            amount: item.amount,
          },
        });
      }

      res.status(201).json({
        message: "Transaksi created successfully",
        transaksi: newTransaksi,
        additionalPoints,
      });
    } catch (error) {
      console.error("Error creating transaksi:", error);
      res.status(500).json({ error: "Failed to create transaksi" });
    }
  },


  // Update transaksi (not implemented in this example)
  PUT: async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(501).json({ error: "Not implemented" });
  },

  // Soft delete transaksi
  DELETE: async (req: NextApiRequest, res: NextApiResponse) => {
    
    const { transaksi_id } = req.body;
    
    if (!transaksi_id) {
      return res.status(400).json({ error: "Transaksi ID is required" });
    }

    try {
      const transaksiExists = await prisma.transaksi.findUnique({
        where: { transaksi_id },
      });

      if (!transaksiExists) {
        return res.status(404).json({ error: "Transaksi not found" });
      }

      await prisma.transaksi.update({
        where: { transaksi_id },
        data: { deletedAt: new Date() },
      });

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting transaksi:", error);
      res.status(500).json({ error: "Failed to delete transaksi" });
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
