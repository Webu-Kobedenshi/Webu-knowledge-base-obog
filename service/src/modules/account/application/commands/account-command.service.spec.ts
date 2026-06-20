import { BadRequestException } from "@nestjs/common";
import { jwtVerify } from "jose";
import type { InitialSettingsInput } from "../dto/account.input";
import type { AccountRepositoryPort } from "../ports/account-repository.port";
import { AccountCommandService } from "./account-command.service";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

describe("AccountCommandService", () => {
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
      updateInitialSettings: jest.fn(),
      updateAdminName: jest.fn(),
      findUserByLinkedGmail: jest.fn(),
      updateLinkedGmail: jest.fn(),
      deleteUserById: jest.fn(),
    } as unknown as AccountRepositoryPort;

    const service = new AccountCommandService(repo);
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

  it("throws BadRequestException for invalid initial settings", () => {
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

  it("normalizes and updates admin name", async () => {
    const { service, repo } = createService();
    (repo.findUserById as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "admin@example.com",
      role: "ADMIN",
    });
    (repo.updateAdminName as jest.Mock).mockResolvedValue({ id: "u1" });

    await service.updateAdminName("u1", { name: "  Admin User  " });

    expect(repo.updateAdminName).toHaveBeenCalledWith("u1", "Admin User");
  });

  it("throws BadRequestException when non-admin updates admin name", async () => {
    const { service, repo } = createService();
    (repo.findUserById as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "student@example.com",
      role: "STUDENT",
    });

    await expect(service.updateAdminName("u1", { name: "Student" })).rejects.toThrow(
      BadRequestException,
    );
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

  it("throws BadRequestException for invalid verification token", async () => {
    const { service } = createService();
    (jwtVerify as jest.Mock).mockRejectedValueOnce(new Error("invalid token"));

    await expect(service.linkGmail("u1", "not-a-token")).rejects.toThrow(BadRequestException);
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

  it("returns current user when the same gmail is already linked", async () => {
    const { service, repo } = createService();
    const token = mockLinkedGmailToken();
    const user = { id: "u1", linkedGmail: "user@gmail.com" };

    (repo.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (repo.findUserByLinkedGmail as jest.Mock).mockResolvedValue(user);

    await expect(service.linkGmail("u1", token)).resolves.toBe(user);
    expect(repo.updateLinkedGmail).not.toHaveBeenCalled();
  });
});
