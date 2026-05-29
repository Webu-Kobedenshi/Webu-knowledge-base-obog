import { BadRequestException } from "@nestjs/common";
import type { InitialSettingsInput, UpdateAlumniProfileInput } from "../dto/alumni.input";
import type { AlumniRepositoryPort } from "../ports/alumni-repository.port";
import type { StoragePort } from "../ports/storage.port";
import { AlumniCommandService } from "./alumni-command.service";

describe("AlumniCommandService", () => {
  const createService = () => {
    const repo = {
      findUserById: jest.fn(),
      upsertAlumniProfile: jest.fn(),
      updateInitialSettings: jest.fn(),
      findUserByLinkedGmail: jest.fn(),
      updateLinkedGmail: jest.fn(),
    } as unknown as AlumniRepositoryPort;

    const storage = {} as StoragePort;

    const service = new AlumniCommandService(repo, storage);
    return { service, repo };
  };

  it("maps domain validation error to BadRequestException", async () => {
    const { service, repo } = createService();

    (repo.findUserById as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "user@example.com",
    });

    await expect(
      service.updateAlumniProfile("u1", {
        graduationYear: 2027,
        department: "IT_EXPERT",
        nickname: "   ",
        companyNames: ["ACME"],
        isPublic: true,
      } satisfies UpdateAlumniProfileInput),
    ).rejects.toThrow(BadRequestException);

    expect(repo.upsertAlumniProfile).not.toHaveBeenCalled();
  });

  it("delegates normalized values to repository", async () => {
    const { service, repo } = createService();

    (repo.findUserById as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "fallback@example.com",
    });

    (repo.upsertAlumniProfile as jest.Mock).mockResolvedValue({ id: "p1" });

    await service.updateAlumniProfile("u1", {
      graduationYear: 2027,
      department: "IT_EXPERT",
      nickname: " taro ",
      companyNames: [" ACME ", "ACME", " Beta "],
      xUrl: " https://x.com/taro ",
      skills: [" React ", "Node", "React", "TypeScript"],
      isPublic: true,
      acceptContact: true,
      portfolioUrl: " https://example.com ",
    } satisfies UpdateAlumniProfileInput);

    expect(repo.upsertAlumniProfile).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        nickname: "taro",
        companyNames: ["ACME", "Beta"],
        contactEmail: "fallback@example.com",
        xUrl: "https://x.com/taro",
        skills: ["React", "Node", "TypeScript"],
        portfolioUrl: "https://example.com",
      }),
    );
  });

  it("normalizes updateInitialSettings and delegates derived fields", async () => {
    const { service, repo } = createService();
    (repo.updateInitialSettings as jest.Mock).mockResolvedValue({ id: "u1" });

    await service.updateInitialSettings("u1", {
      name: "  Taro  ",
      studentId: " 24A0001 ",
      enrollmentYear: 2025,
      durationYears: 1,
      department: "IT_EXPERT",
    } satisfies InitialSettingsInput);

    expect(repo.updateInitialSettings).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        name: "Taro",
        studentId: "24A0001",
        durationYears: 4,
        role: "STUDENT",
        status: "ENROLLED",
      }),
    );
  });

  it("throws BadRequestException for invalid initial settings", async () => {
    const { service } = createService();

    expect(() =>
      service.updateInitialSettings("u1", {
        name: "   ",
        studentId: "24A0002",
        enrollmentYear: 2025,
        durationYears: 2,
        department: "PROGRAMMING",
      } satisfies InitialSettingsInput),
    ).toThrow(BadRequestException);
  });

  it("normalizes gmail and delegates linkGmail", async () => {
    const { service, repo } = createService();

    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(null);
    (repo.updateLinkedGmail as jest.Mock).mockResolvedValue({ id: "u1" });

    await service.linkGmail("u1", "  USER@GMAIL.COM ");

    expect(repo.findUserByLinkedGmail).toHaveBeenCalledWith("user@gmail.com");
    expect(repo.updateLinkedGmail).toHaveBeenCalledWith("u1", "user@gmail.com");
  });

  it("throws BadRequestException for non-gmail address", async () => {
    const { service } = createService();

    await expect(service.linkGmail("u1", "user@example.com")).rejects.toThrow(BadRequestException);
  });
});
