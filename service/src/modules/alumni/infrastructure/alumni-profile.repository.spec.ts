import type { PrismaService } from "../../../prisma.service";
import { AlumniProfileRepository } from "./alumni-profile.repository";

describe("AlumniProfileRepository", () => {
  const createRepository = () => {
    const prisma = {
      alumniProfile: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
    } as unknown as PrismaService;

    return {
      prisma,
      repository: new AlumniProfileRepository(prisma),
    };
  };

  it("uses default public list order when sort is omitted", async () => {
    const { prisma, repository } = createRepository();

    await repository.findPublicListItems({
      limit: 12,
      offset: 0,
    });

    expect(prisma.alumniProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
      }),
    );
  });

  it("orders public list items by helpful reaction count when requested", async () => {
    const { prisma, repository } = createRepository();

    await repository.findPublicListItems({
      sort: "HELPFUL",
      limit: 12,
      offset: 0,
    });

    expect(prisma.alumniProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { helpfulReactions: { _count: "desc" } },
          { graduationYear: "desc" },
          { createdAt: "desc" },
        ],
      }),
    );
  });
});
