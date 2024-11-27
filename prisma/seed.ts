import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Hash password for the employee
    const password = await bcrypt.hash('password123', 10);

    // Seed Pegawai
    const pegawai = await prisma.pegawai.create({
        data: {
            name: 'Admin',
            username: 'mal01',
            password: 'password123',
            role: {
                create: { name: 'Admin' },
            },
        },
    });

    // Seed LevelMember
    const levelGold = await prisma.levelMember.create({
        data: { name: 'Gold', diskon: 20, minimum_point: 100 },
    });
    const levelSilver = await prisma.levelMember.create({
        data: { name: 'Silver', diskon: 10, minimum_point: 50 },
    });
    const levelBronze = await prisma.levelMember.create({
        data: { name: 'Bronze', diskon: 5, minimum_point: 10 },
    });

    // Seed Menu
    const menu1 = await prisma.menu.create({
        data: { name: 'Nasi Goreng', description: 'Delicious fried rice', stok: 10, price: 20000 },
    });
    const menu2 = await prisma.menu.create({
        data: { name: 'Mie Ayam', description: 'Tasty chicken noodles', stok: 15, price: 15000 },
    });
    const menu3 = await prisma.menu.create({
        data: { name: 'Es Teh Manis', description: 'Sweet iced tea', stok: 20, price: 5000 },
    });

    // Seed Pelanggan
    const customer1 = await prisma.pelanggan.create({
        data: { name: 'John Doe', points: 120, level_member_id: levelGold.level_member_id },
    });
    const customer2 = await prisma.pelanggan.create({
        data: { name: 'Jane Smith', points: 60, level_member_id: levelSilver.level_member_id },
    });
    const customer3 = await prisma.pelanggan.create({
        data: { name: 'Alice Brown', points: 30, level_member_id: levelBronze.level_member_id },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
