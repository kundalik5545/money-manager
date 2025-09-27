const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create accounts
  const bankAccount = await prisma.account.create({
    data: {
      name: 'Chase Checking',
      type: 'BANK',
      balance: 5000
    }
  })

  const wallet = await prisma.account.create({
    data: {
      name: 'Cash Wallet',
      type: 'WALLET',
      balance: 200
    }
  })

  const creditCard = await prisma.account.create({
    data: {
      name: 'Visa Credit Card',
      type: 'CREDIT_CARD',
      balance: -1200
    }
  })

  // Create income categories
  const salaryCategory = await prisma.category.create({
    data: {
      name: 'Salary',
      type: 'INCOME',
      color: '#10b981'
    }
  })

  const freelanceCategory = await prisma.category.create({
    data: {
      name: 'Freelance',
      type: 'INCOME',
      color: '#06b6d4'
    }
  })

  // Create expense categories
  const foodCategory = await prisma.category.create({
    data: {
      name: 'Food & Dining',
      type: 'EXPENSE',
      color: '#f59e0b'
    }
  })

  const transportCategory = await prisma.category.create({
    data: {
      name: 'Transportation',
      type: 'EXPENSE',
      color: '#ef4444'
    }
  })

  const shoppingCategory = await prisma.category.create({
    data: {
      name: 'Shopping',
      type: 'EXPENSE',
      color: '#8b5cf6'
    }
  })

  const utilitiesCategory = await prisma.category.create({
    data: {
      name: 'Utilities',
      type: 'EXPENSE',
      color: '#6b7280'
    }
  })

  // Create subcategories
  await prisma.subcategory.create({
    data: {
      name: 'Restaurants',
      categoryId: foodCategory.id
    }
  })

  await prisma.subcategory.create({
    data: {
      name: 'Groceries',
      categoryId: foodCategory.id
    }
  })

  await prisma.subcategory.create({
    data: {
      name: 'Gas',
      categoryId: transportCategory.id
    }
  })

  await prisma.subcategory.create({
    data: {
      name: 'Public Transport',
      categoryId: transportCategory.id
    }
  })

  // Create sample transactions
  const transactions = [
    // Income transactions
    {
      amount: 4500,
      description: 'Monthly Salary',
      date: new Date('2024-06-01'),
      accountId: bankAccount.id,
      categoryId: salaryCategory.id
    },
    {
      amount: 800,
      description: 'Freelance Project Payment',
      date: new Date('2024-06-15'),
      accountId: bankAccount.id,
      categoryId: freelanceCategory.id
    },
    
    // Expense transactions
    {
      amount: 120,
      description: 'Whole Foods Grocery Shopping',
      date: new Date('2024-06-02'),
      accountId: bankAccount.id,
      categoryId: foodCategory.id
    },
    {
      amount: 45,
      description: 'Restaurant Dinner',
      date: new Date('2024-06-03'),
      accountId: creditCard.id,
      categoryId: foodCategory.id
    },
    {
      amount: 60,
      description: 'Gas Station Fill-up',
      date: new Date('2024-06-05'),
      accountId: bankAccount.id,
      categoryId: transportCategory.id
    },
    {
      amount: 25,
      description: 'Metro Card',
      date: new Date('2024-06-06'),
      accountId: wallet.id,
      categoryId: transportCategory.id
    },
    {
      amount: 200,
      description: 'Online Shopping - Amazon',
      date: new Date('2024-06-08'),
      accountId: creditCard.id,
      categoryId: shoppingCategory.id
    },
    {
      amount: 150,
      description: 'Electricity Bill',
      date: new Date('2024-06-10'),
      accountId: bankAccount.id,
      categoryId: utilitiesCategory.id
    },
    {
      amount: 35,
      description: 'Coffee Shop',
      date: new Date('2024-06-12'),
      accountId: wallet.id,
      categoryId: foodCategory.id
    },
    {
      amount: 80,
      description: 'Clothing Store',
      date: new Date('2024-06-14'),
      accountId: creditCard.id,
      categoryId: shoppingCategory.id
    }
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })