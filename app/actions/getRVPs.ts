'use server'

import prisma from "@/lib/prisma";

export async function getRVPs(Filter?: string) {
  const where = Filter
    ? {
        code: {
          startsWith: Filter,
        },
      }
    : {};

  const grades = await prisma.rVP.findMany({
    select: {
      code: true,
      name: true,
    },
    where,
  });

  return grades.reduce((acc, RVP) => {
    acc[RVP.code] = RVP.name;
    return acc;
  }, {} as Record<string, string>);
}
