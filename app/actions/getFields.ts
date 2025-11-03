'use server'

import prisma from "@/lib/prisma";

export async function getFields() {
  const fields = await prisma.fields.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return fields.reduce((acc, field) => {
    acc[field.id] = field.name;
    return acc;
  }, {} as Record<string, string>);
}
