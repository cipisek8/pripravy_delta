import prisma from "@/lib/prisma";

export async function changeReview(id: string, state: boolean) {
    await prisma.preparations.update({ where: { id }, data: { reviewing: false, uploaded: state } });
}