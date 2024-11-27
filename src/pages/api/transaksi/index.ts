import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const methods: Record<
  "GET" | "POST" | "PUT" | "DELETE",
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  // Fetch all transactions
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const { transaksi_id } = req.query; // Ambil parameter transaksi_id dari query string
  
    try {
      if (transaksi_id) {
        // Fetch specific transaction by ID
        const transaksi = await prisma.transaksi.findMany({
          where: { transaksi_id: Number(transaksi_id) },
          include: {
            pelanggan: true,
            detail_transaksi: {
              include: { menu: true },
              
            },
          },
          orderBy: { tanggal_transaksi: 'desc' },
        });
  
        if (!transaksi) {
          return res.status(404).json({ error: "Transaksi not found" });
        }
  
        return res.status(200).json(transaksi);
      }
  
      // Fetch all transactions if no ID is provided
      const transactions = await prisma.transaksi.findMany({
        where: { deletedAt: null },
        include: {
          pelanggan: true,
          detail_transaksi: {
            include: { menu: true },
          },
        },
        orderBy: { tanggal_transaksi: 'desc' },
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
      // Fetch pelanggan and current points
      const pelanggan = await prisma.pelanggan.findUnique({
        where: { pelanggan_id },
      });
  
      if (!pelanggan) {
        return res.status(404).json({ error: "Pelanggan not found" });
      }
  
      const pelangganPoints = pelanggan.points;
  
      // Fetch applicable level member based on points
      const applicableLevelMember = await prisma.levelMember.findFirst({
        where: { minimum_point: { lte: pelangganPoints } },
        orderBy: { minimum_point: "desc" },
      });
  
      console.log('Applicable level member:', applicableLevelMember);
  
      // Update pelanggan's level_member_id if applicable
      if (applicableLevelMember && pelanggan.level_member_id !== applicableLevelMember.level_member_id) {
        await prisma.pelanggan.update({
          where: { pelanggan_id },
          data: {
            level_member_id: applicableLevelMember.level_member_id,
          },
        });
      }
  
      const diskonRate = (applicableLevelMember?.diskon ?? 0) / 100;
  
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
  
      console.log('Total harga sebelum diskon:', totalHarga);
      console.log('Diskon rate:', diskonRate);
  
      // Apply discount if applicable
      const discountedTotal = totalHarga - totalHarga * diskonRate;
  
      // Calculate additional points (1 point per Rp10,000) only if no diskon is applied
      const additionalPoints = Math.floor(totalHarga / 10000);
  
      // Update pelanggan points
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
          diskon: applicableLevelMember?.diskon ?? 0,
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
