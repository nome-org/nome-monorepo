import { prisma } from "../prisma/client.js"

const claims = await prisma.claim.findMany({
  where: {
    freeAmount: {
      gt: 0,
    },
    claimedAmount: 0,
  },
  include: {
    orders: true,
  },
})

for (const claim of claims) {
  if (claim.orders.length === 0) {
    await prisma.claim.delete({
      where: {
        id: claim.id,
      },
    })
  }
}
