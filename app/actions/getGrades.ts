'use server'

import prisma from "@/lib/prisma";

export async function getGrades() {
  const grades = await prisma.grades.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return grades.reduce((acc, field) => {
    acc[field.id] = field.name;
    return acc;
  }, {} as Record<number, string>);
}
