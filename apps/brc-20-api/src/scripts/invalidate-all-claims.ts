import { prisma } from "../prisma/client.js"

const claims = await prisma.claim.findMany({
  where: {
    freeAmount: {
      gt: 0,
    },
    claimedAmount: 0,
  },
})

for (const claim of claims) {
  await prisma.claim.update({
    where: {
      id: claim.id,
    },
    data: {
      claimedAmount: claim.freeAmount,
    },
  })
}
