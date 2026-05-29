import type { AlumniRepository } from "../../infrastructure/alumni.repository";
import type { AlumniConnectionDto, AlumniProfileDto, UserDto } from "../dto/alumni.dto";
import { AlumniQueryService } from "./alumni-query.service";

function createUser(overrides?: Partial<UserDto>): UserDto {
  return {
    id: "u1",
    email: "user@example.com",
    name: "Taro",
    studentId: "24A0001",
    linkedGmail: null,
    role: "STUDENT",
    status: "ENROLLED",
    enrollmentYear: 2025,
    durationYears: 4,
    department: "IT_EXPERT",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    alumniProfile: null,
    ...overrides,
  };
}

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
      findPublicById: jest.fn(),
      findUserById: jest.fn(),
      findUserByLinkedGmail: jest.fn(),
    } as unknown as AlumniRepository;

    const service = new AlumniQueryService(repo);
    return { service, repo };
  };

  describe("getAlumniList", () => {
    it("delegates filters to repository", async () => {
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
  });

  describe("getAlumniDetail", () => {
    it("returns null when alumni not found", async () => {
      const { service, repo } = createService();
      (repo.findPublicById as jest.Mock).mockResolvedValue(null);

      const result = await service.getAlumniDetail("a1");

      expect(repo.findPublicById).toHaveBeenCalledWith("a1");
      expect(result).toBeNull();
    });

    it("returns alumni profile when found", async () => {
      const { service, repo } = createService();
      const alumni = {
        id: "a1",
        userId: "u1",
        nickname: "Taro",
        graduationYear: 2027,
        department: "IT_EXPERT",
        companyNames: ["ACME"],
        companyExperiences: [
          {
            id: "c1",
            companyName: "ACME",
            selectionExperience: null,
          },
        ],
        remarks: null,
        contactEmail: "user@example.com",
        avatarUrl: null,
        skills: [],
        portfolioUrl: null,
        gakuchika: null,
        usefulCoursework: null,
        isPublic: true,
        acceptContact: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      } satisfies AlumniProfileDto;
      (repo.findPublicById as jest.Mock).mockResolvedValue(alumni);

      const result = await service.getAlumniDetail("a1");

      expect(result).toEqual(alumni);
    });
  });

  describe("getMyProfile", () => {
    it("returns null when user not found", async () => {
      const { service, repo } = createService();
      (repo.findUserById as jest.Mock).mockResolvedValue(null);

      const result = await service.getMyProfile("u1");

      expect(result).toBeNull();
    });

    it("returns profile as-is when role/status already match", async () => {
      const { service, repo } = createService();
      const profile = createUser({
        enrollmentYear: 2025,
        durationYears: 4,
        role: "STUDENT",
        status: "ENROLLED",
      });
      (repo.findUserById as jest.Mock).mockResolvedValue(profile);

      const result = await service.getMyProfile("u1");

      expect(result).toEqual(profile);
    });

    it("returns profile with resolved role/status when mismatch", async () => {
      const { service, repo } = createService();
      const profile = createUser({
        enrollmentYear: 2020,
        durationYears: 1,
        role: "STUDENT",
        status: "ENROLLED",
      });
      (repo.findUserById as jest.Mock).mockResolvedValue(profile);

      const result = await service.getMyProfile("u1");

      expect(result).toEqual(
        expect.objectContaining({
          role: "ALUMNI",
          status: "GRADUATED",
        }),
      );
    });

    it("returns profile as-is when enrollment info is incomplete", async () => {
      const { service, repo } = createService();
      const profile = createUser({
        enrollmentYear: null,
        durationYears: null,
      });
      (repo.findUserById as jest.Mock).mockResolvedValue(profile);

      const result = await service.getMyProfile("u1");

      expect(result).toEqual(profile);
    });
  });

  describe("findUserByLinkedGmail", () => {
    it("delegates to repository", async () => {
      const { service, repo } = createService();
      const profile = createUser({ linkedGmail: "user@gmail.com" });
      (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(profile);

      const result = await service.findUserByLinkedGmail("user@gmail.com");

      expect(repo.findUserByLinkedGmail).toHaveBeenCalledWith("user@gmail.com");
      expect(result).toEqual(profile);
    });
  });
});
