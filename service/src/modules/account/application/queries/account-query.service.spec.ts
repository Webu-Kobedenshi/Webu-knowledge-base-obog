import type { UserDto } from "../dto/account.dto";
import type { AccountRepositoryPort } from "../ports/account-repository.port";
import { AccountQueryService } from "./account-query.service";

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

describe("AccountQueryService", () => {
  const createService = () => {
    const repo = {
      findUserById: jest.fn(),
      findUserByLinkedGmail: jest.fn(),
      isAdminEmail: jest.fn(),
    } as unknown as AccountRepositoryPort;

    const service = new AccountQueryService(repo);
    return { service, repo };
  };

  it("returns null when user not found", async () => {
    const { service, repo } = createService();
    (repo.findUserById as jest.Mock).mockResolvedValue(null);

    const result = await service.getMyProfile("u1");

    expect(result).toBeNull();
  });

  it("returns profile with resolved role/status when mismatch", async () => {
    const { service, repo } = createService();
    (repo.findUserById as jest.Mock).mockResolvedValue(
      createUser({
        enrollmentYear: 2020,
        durationYears: 1,
        role: "STUDENT",
        status: "ENROLLED",
      }),
    );

    const result = await service.getMyProfile("u1");

    expect(result).toEqual(
      expect.objectContaining({
        role: "ALUMNI",
        status: "GRADUATED",
      }),
    );
  });

  it("does not apply student graduation role resolution to admin profiles", async () => {
    const { service, repo } = createService();
    const profile = createUser({
      role: "ADMIN",
      enrollmentYear: 2020,
      durationYears: 1,
    });
    (repo.findUserById as jest.Mock).mockResolvedValue(profile);

    const result = await service.getMyProfile("u1");

    expect(result).toEqual(profile);
  });

  it("delegates findUserByLinkedGmail", async () => {
    const { service, repo } = createService();
    const profile = createUser({ linkedGmail: "user@gmail.com" });
    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(profile);

    const result = await service.findUserByLinkedGmail("user@gmail.com");

    expect(repo.findUserByLinkedGmail).toHaveBeenCalledWith("user@gmail.com");
    expect(result).toEqual(profile);
  });

  it("delegates isAdminEmail", async () => {
    const { service, repo } = createService();
    (repo.isAdminEmail as jest.Mock).mockResolvedValue(true);

    const result = await service.isAdminEmail("teacher@example.com");

    expect(repo.isAdminEmail).toHaveBeenCalledWith("teacher@example.com");
    expect(result).toBe(true);
  });
});
