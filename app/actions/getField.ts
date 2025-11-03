'use server'

import prisma from "@/lib/prisma"

export async function getField(fieldId: string) {
  const field = await prisma.fields.findUnique({
    where: { id: fieldId },
    select: { name: true },
  })

  if (!field) throw new Error(`Field with id ${fieldId} not found`)

  return field.name
}
