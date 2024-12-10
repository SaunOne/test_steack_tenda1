import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { month, year } = req.query;

  // Validasi input
  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (
    isNaN(parsedMonth) ||
    isNaN(parsedYear) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    parsedYear < 2000 ||
    parsedYear > 2100
  ) {
    return res.status(400).json({ message: "Month or year is invalid" });
  }

  try {
    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 0);

    const transactions = await prisma.transaksi.findMany({
      where: {
        tanggal_transaksi: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        detail_transaksi: {
          include: {
            menu: true,
          },
        },
      },
    });

    // Summarize data
    const summary = transactions.reduce(
      (acc, transaksi) => {
        acc.totalTransactions += 1;
        acc.totalRevenue += transaksi.total_harga;
        acc.totalDiscount += transaksi.total_diskon;

        transaksi.detail_transaksi.forEach((detail) => {
          if (!acc.items[detail.menu_id]) {
            acc.items[detail.menu_id] = {
              name: detail.menu.name,
              amount: 0,
              revenue: 0,
            };
          }
          acc.items[detail.menu_id].amount += detail.amount;
          acc.items[detail.menu_id].revenue +=
            detail.amount * detail.menu.price;
        });

        return acc;
      },
      {
        totalTransactions: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        items: {},
      }
    );

    res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
