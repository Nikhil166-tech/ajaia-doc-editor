import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Ajaia Docs - Access Control & Sharing Logic", () => {
  let ownerUser: any;
  let sharedUser: any;
  let unauthorizedUser: any;
  let testDoc: any;

  beforeAll(async () => {
    // Create test fixtures
    ownerUser = await prisma.user.create({
      data: {
        email: `test_owner_${Date.now()}@test.com`,
        name: "Test Owner",
      },
    });

    sharedUser = await prisma.user.create({
      data: {
        email: `test_shared_${Date.now()}@test.com`,
        name: "Test Collaborator",
      },
    });

    unauthorizedUser = await prisma.user.create({
      data: {
        email: `test_unauth_${Date.now()}@test.com`,
        name: "Test Outsider",
      },
    });

    testDoc = await prisma.document.create({
      data: {
        title: "Test Access Control Document",
        content: "<p>Restricted content</p>",
        ownerId: ownerUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.documentShare.deleteMany({ where: { documentId: testDoc.id } });
    await prisma.document.delete({ where: { id: testDoc.id } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [ownerUser.id, sharedUser.id, unauthorizedUser.id] },
      },
    });
    await prisma.$disconnect();
  });

  it("identifies the document owner correctly", async () => {
    const doc = await prisma.document.findUnique({
      where: { id: testDoc.id },
      include: { owner: true },
    });

    expect(doc).toBeDefined();
    expect(doc?.ownerId).toBe(ownerUser.id);
    expect(doc?.owner.email).toBe(ownerUser.email);
  });

  it("denies access to an unauthorized user", async () => {
    const doc = await prisma.document.findUnique({
      where: { id: testDoc.id },
      include: { shares: true },
    });

    const isOwner = doc?.ownerId === unauthorizedUser.id;
    const isShared = doc?.shares.some((s) => s.userId === unauthorizedUser.id);

    expect(isOwner).toBe(false);
    expect(isShared).toBe(false);
  });

  it("allows granting and verifying edit permissions to another user", async () => {
    const share = await prisma.documentShare.create({
      data: {
        documentId: testDoc.id,
        userId: sharedUser.id,
        permission: "edit",
      },
    });

    expect(share.permission).toBe("edit");

    const docWithShares = await prisma.document.findUnique({
      where: { id: testDoc.id },
      include: { shares: true },
    });

    const userShare = docWithShares?.shares.find(
      (s) => s.userId === sharedUser.id
    );

    expect(userShare).toBeDefined();
    expect(userShare?.permission).toBe("edit");
  });

  it("allows revoking access cleanly", async () => {
    await prisma.documentShare.deleteMany({
      where: {
        documentId: testDoc.id,
        userId: sharedUser.id,
      },
    });

    const remainingShares = await prisma.documentShare.findMany({
      where: { documentId: testDoc.id, userId: sharedUser.id },
    });

    expect(remainingShares.length).toBe(0);
  });
});
