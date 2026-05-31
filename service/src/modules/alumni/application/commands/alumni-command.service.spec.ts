import { BadRequestException } from "@nestjs/common";
import { jwtVerify } from "jose";
import type { InitialSettingsInput, UpdateAlumniProfileInput } from "../dto/alumni.input";
import type { AlumniRepositoryPort } from "../ports/alumni-repository.port";
import type { StoragePort } from "../ports/storage.port";
import { AlumniCommandService } from "./alumni-command.service";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

describe("AlumniCommandService", () => {
  const originalAuthJwtSecret = process.env.AUTH_JWT_SECRET;
  const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;
  const testSecret = "test-secret";

  beforeEach(() => {
    process.env.AUTH_JWT_SECRET = testSecret;
    process.env.NEXTAUTH_SECRET = undefined;
  });

  afterEach(() => {
    process.env.AUTH_JWT_SECRET = originalAuthJwtSecret;
    process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
    jest.restoreAllMocks();
  });

  const createService = () => {
    const repo = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      upsertAlumniProfile: jest.fn(),
      updateInitialSettings: jest.fn(),
      findUserByLinkedGmail: jest.fn(),
      updateLinkedGmail: jest.fn(),
    } as unknown as AlumniRepositoryPort;

    const storage = {} as StoragePort;

    const service = new AlumniCommandService(repo, storage);
    return { service, repo };
  };

  const mockLinkedGmailToken = ({
    userId = "u1",
    gmail = "user@gmail.com",
    purpose = "linked-gmail-verification",
  }: {
    userId?: string;
    gmail?: string;
    purpose?: string;
  } = {}) => {
    (jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: {
        purpose,
        gmail,
        verifiedAt: new Date().toISOString(),
        sub: userId,
      },
    });

    return "verified-token";
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

  it("normalizes verified gmail and delegates linkGmail", async () => {
    const { service, repo } = createService();
    const token = mockLinkedGmailToken({ gmail: "  USER@GMAIL.COM " });

    (repo.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(null);
    (repo.updateLinkedGmail as jest.Mock).mockResolvedValue({ id: "u1" });

    await service.linkGmail("u1", token);

    expect(repo.findUserByLinkedGmail).toHaveBeenCalledWith("user@gmail.com");
    expect(repo.updateLinkedGmail).toHaveBeenCalledWith("u1", "user@gmail.com");
  });

  it("throws BadRequestException for non-gmail verified address", async () => {
    const { service } = createService();
    const token = mockLinkedGmailToken({ gmail: "user@example.com" });

    await expect(service.linkGmail("u1", token)).rejects.toThrow(BadRequestException);
  });

  it("throws BadRequestException for missing verification token", async () => {
    const { service } = createService();
    (jwtVerify as jest.Mock).mockRejectedValueOnce(new Error("invalid token"));

    await expect(service.linkGmail("u1", "not-a-token")).rejects.toThrow(BadRequestException);
  });

  it("throws BadRequestException for expired verification token", async () => {
    const { service } = createService();
    (jwtVerify as jest.Mock).mockRejectedValueOnce(new Error("token expired"));

    await expect(service.linkGmail("u1", "expired-token")).rejects.toThrow(BadRequestException);
  });

  it("throws BadRequestException for another user's verification token", async () => {
    const { service } = createService();
    const token = mockLinkedGmailToken({ userId: "u2" });

    await expect(service.linkGmail("u1", token)).rejects.toThrow(BadRequestException);
  });

  it("throws BadRequestException when another user already linked the gmail", async () => {
    const { service, repo } = createService();
    const token = mockLinkedGmailToken();

    (repo.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue({ id: "u2" });

    await expect(service.linkGmail("u1", token)).rejects.toThrow(
      "このGmailアドレスは既に他のアカウントに登録されています。",
    );
    expect(repo.updateLinkedGmail).not.toHaveBeenCalled();
  });

  it("throws BadRequestException when another user's primary email matches the gmail", async () => {
    const { service, repo } = createService();
    const token = mockLinkedGmailToken();

    (repo.findUserByEmail as jest.Mock).mockResolvedValue({ id: "u2", email: "user@gmail.com" });

    await expect(service.linkGmail("u1", token)).rejects.toThrow(
      "このGmailアドレスは既に他のアカウントに登録されています。",
    );
    expect(repo.findUserByLinkedGmail).not.toHaveBeenCalled();
    expect(repo.updateLinkedGmail).not.toHaveBeenCalled();
  });

  it("returns current user when the same gmail is already linked", async () => {
    const { service, repo } = createService();
    const token = mockLinkedGmailToken();
    const user = { id: "u1", linkedGmail: "user@gmail.com" };

    (repo.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(user);

    await expect(service.linkGmail("u1", token)).resolves.toBe(user);
    expect(repo.updateLinkedGmail).not.toHaveBeenCalled();
  });

  it("maps unique constraint conflicts to duplicate gmail error", async () => {
    const { service, repo } = createService();
    const token = mockLinkedGmailToken();

    (repo.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(null);
    (repo.updateLinkedGmail as jest.Mock).mockRejectedValue({ code: "P2002" });

    await expect(service.linkGmail("u1", token)).rejects.toThrow(
      "このGmailアドレスは既に他のアカウントに登録されています。",
    );
  });
});
