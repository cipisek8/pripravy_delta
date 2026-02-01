'use server'

import prisma from "@/lib/prisma"

export async function getGrade(gradeId: number) {
  const grade = await prisma.grades.findUnique({
    where: { id: gradeId },
    select: { name: true },
  })

  if (!grade) throw new Error(`Grade with id ${gradeId} not found`)

  return grade.name
}
