// This is what Prisma generates automatically from our schema:

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🎯 FULLY TYPE-SAFE - All generated from schema.prisma
async function createTransaction() {
  const transaction = await prisma.transaction.create({
    data: {
      yachtId: "yacht-123",
      amount: 150.50,
      currencyCodeId: "usd",
      description: "Fuel purchase",
      transactionDate: new Date(),
      createdByUserId: "user-456"
    },
    include: {
      yacht: {
        include: {
          owner: {
            include: { profile: true }
          }
        }
      },
      currencyCode: true,
      receipt: true,
      flags: {
        include: { flagType: true }
      }
    }
  });
  
  // TypeScript knows all these types automatically!
  console.log(transaction.yacht.owner.profile.firstName);
  console.log(transaction.currencyCode.symbol);
  console.log(transaction.flags[0]?.flagType.name);
}

// 🚀 Complex queries made simple
async function getDashboardStats() {
  const stats = await prisma.yacht.findMany({
    include: {
      transactions: {
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
      },
      cashBalances: {
        include: { currencyCode: true }
      },
      _count: {
        select: { transactions: true }
      }
    }
  });
  
  return stats;
} 