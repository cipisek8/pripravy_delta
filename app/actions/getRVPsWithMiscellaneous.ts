'use server'

import prisma from "@/lib/prisma";
export async function getRVPsWithMiscellaneous(startFilter?: string, grade?: number) {
  let containFilter = undefined;
  let containFilter2 = undefined;
  if (grade === 1) {
    containFilter = "ZV5";
    containFilter2 = "ZV3";
  } else if (grade > 1) {
    containFilter = "ZV9";
  }

    if(startFilter === '' || startFilter === null) {
      startFilter = undefined;
    }

    const where = {
        AND: [
          {
            OR: startFilter === undefined
              ? []
              : [
                {
                  code: {
                    startsWith: startFilter,
                  },
                },
                {
                  code: {
                    startsWith: "K",
                  },
                },
                {
                  code: {
                    startsWith: "P",
                  },
                },
                {
                  code: {
                    startsWith: "Z",
                  },
                },
              ],
          },
          {
        OR: [
              {code: {
                contains: containFilter,
              },
            },
            {
              code: {
                contains: containFilter2,
              },
            }
        ],
      }
        ],
      };

    const grades = await prisma.rVP.findMany({
      select: {
        code: true,
        name: true,
      },
      orderBy: {
        code: "asc",
      },
      where,
    });

    return grades.reduce((acc, RVP) => {
      acc[RVP.code] = RVP.name;
      return acc;
    }, {} as Record<string, string>);
  }