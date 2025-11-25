import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking batches in database...\n");

    const batches = await prisma.batch.findMany({
        include: {
            department: true,
            curriculum: true,
            students: true,
        },
    });

    console.log(`📊 Total Batches: ${batches.length}\n`);

    batches.forEach((batch, index) => {
        console.log(`${index + 1}. Batch: ${batch.name} (${batch.year})`);
        console.log(`   Department: ${batch.department?.nameAr || "N/A"}`);
        console.log(`   Curriculum: ${batch.curriculum?.name || "N/A"}`);
        console.log(`   Students: ${batch.students.length}`);
        console.log(`   Credits: ${batch.minCredits}-${batch.maxCredits}`);
        console.log();
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
