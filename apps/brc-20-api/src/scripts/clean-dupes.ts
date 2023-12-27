import { prisma } from "../prisma/client.js"

async function main() {
  const allClaims = await prisma.claim.findMany({})

  for (const claim of allClaims) {
    const dupes = await prisma.claim.findMany({
      where: {
        ordinalAddress: claim.ordinalAddress,
      },
      orderBy: {
        freeAmount: "desc",
      },
    })
    console.log(dupes.map((d) => [d.ordinalAddress, d.freeAmount]))
  }
}

await main()
