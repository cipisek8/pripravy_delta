'use server'

import prisma from "@/lib/prisma"

export async function getRVP(RVPCode: string) {
  const RVP = await prisma.rVP.findUnique({ //WTF proc maly r ???
    where: { code: RVPCode },
    select: { name: true },
  })

  if (!RVP) throw new Error(`RVP with code ${RVPCode} not found`)

  return RVP.name
}
