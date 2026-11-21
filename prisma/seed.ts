import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const alice = await prisma.user.create({
    data: {
      id: "user_alice",
      email: "alice@ajaia.test",
      name: "Alice Johnson",
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "user_bob",
      email: "bob@ajaia.test",
      name: "Bob Smith",
    },
  });

  // Seed initial document for Alice
  const doc = await prisma.document.create({
    data: {
      title: "Welcome to Ajaia Docs",
      content: `<h1>Welcome to Ajaia Docs</h1><p>This is a lightweight, full-stack collaborative document editor inspired by Google Docs.</p><h2>Key Features:</h2><ul><li><strong>Rich-text editing:</strong> Bold, italic, underline, headings, lists</li><li><strong>File imports:</strong> Upload .md or .txt files directly</li><li><strong>Sharing:</strong> Grant view or edit permissions to other team members</li><li><strong>Persistent storage:</strong> Real-time debounced auto-saving</li></ul><p>Feel free to edit this document or create a new one!</p>`,
      ownerId: alice.id,
    },
  });

  // Share this document with Bob
  await prisma.documentShare.create({
    data: {
      documentId: doc.id,
      userId: bob.id,
      permission: "edit",
    },
  });

  console.log("Seeding complete!");
  console.log("Users:", { alice: alice.email, bob: bob.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
