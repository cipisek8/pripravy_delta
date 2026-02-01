'use server'

import prisma from "@/lib/prisma";

export async function getFields() {
  const fields = await prisma.fields.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return fields.reduce((acc, field) => {
    if(field.id.includes('-')) acc[field.id] = "-- "+field.name;
    else
    acc[field.id] = field.name;
    return acc;
  }, {} as Record<string, string>);
}
