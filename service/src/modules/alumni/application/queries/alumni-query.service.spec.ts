import type { AlumniConnectionDto } from "../dto/alumni.dto";
import type { AlumniProfileRepositoryPort } from "../ports/alumni-profile-repository.port";
import { AlumniQueryService } from "./alumni-query.service";

function createAlumniConnection(overrides?: Partial<AlumniConnectionDto>): AlumniConnectionDto {
  return {
    items: [],
    totalCount: 0,
    hasNextPage: false,
    ...overrides,
  };
}

describe("AlumniQueryService", () => {
  const createService = () => {
    const repo = {
      findPublicList: jest.fn(),
      findPublicListItems: jest.fn(),
      findPublicCompanyNameSuggestions: jest.fn(),
      findPublicById: jest.fn(),
    } as unknown as AlumniProfileRepositoryPort;

    const service = new AlumniQueryService(repo);
    return { service, repo };
  };

  it("delegates list filters to repository", async () => {
    const { service, repo } = createService();
    const expected = createAlumniConnection({ totalCount: 2, hasNextPage: true });
    (repo.findPublicList as jest.Mock).mockResolvedValue(expected);

    const result = await service.getAlumniList({
      department: "IT_EXPERT",
      company: "ACME",
      graduationYear: 2027,
      limit: 10,
      offset: 5,
    });

    expect(repo.findPublicList).toHaveBeenCalledWith({
      department: "IT_EXPERT",
      company: "ACME",
      graduationYear: 2027,
      limit: 10,
      offset: 5,
    });
    expect(result).toEqual(expected);
  });

  it("delegates list item filters to lightweight repository query", async () => {
    const { service, repo } = createService();
    const expected = createAlumniConnection({ totalCount: 2, hasNextPage: true });
    (repo.findPublicListItems as jest.Mock).mockResolvedValue(expected);

    const result = await service.getAlumniListItems({
      department: "IT_EXPERT",
      company: "ACME",
      graduationYear: 2027,
      limit: 10,
      offset: 5,
    });

    expect(repo.findPublicListItems).toHaveBeenCalledWith({
      department: "IT_EXPERT",
      company: "ACME",
      graduationYear: 2027,
      limit: 10,
      offset: 5,
    });
    expect(result).toEqual(expected);
  });

  it("delegates trimmed company suggestion query to repository", async () => {
    const { service, repo } = createService();
    const expected = ["ACME", "ACME Japan"];
    (repo.findPublicCompanyNameSuggestions as jest.Mock).mockResolvedValue(expected);

    const result = await service.getCompanyNameSuggestions(" AC ", 5);

    expect(repo.findPublicCompanyNameSuggestions).toHaveBeenCalledWith("AC", 5);
    expect(result).toEqual(expected);
  });

  it("returns empty suggestions without repository call when query is blank", async () => {
    const { service, repo } = createService();

    const result = await service.getCompanyNameSuggestions("   ");

    expect(repo.findPublicCompanyNameSuggestions).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("delegates detail lookup with viewer id", async () => {
    const { service, repo } = createService();
    (repo.findPublicById as jest.Mock).mockResolvedValue(null);

    const result = await service.getAlumniDetail("a1", "u1");

    expect(repo.findPublicById).toHaveBeenCalledWith("a1", "u1");
    expect(result).toBeNull();
  });
});
