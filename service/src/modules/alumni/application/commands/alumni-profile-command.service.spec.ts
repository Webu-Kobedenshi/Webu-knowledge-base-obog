import { BadRequestException } from "@nestjs/common";
import type { AccountRepositoryPort } from "../../../account/application/ports/account-repository.port";
import type { StoragePort } from "../../../media/application/ports/storage.port";
import type { UpdateAlumniProfileInput } from "../dto/alumni.input";
import type { AlumniProfileRepositoryPort } from "../ports/alumni-profile-repository.port";
import { AlumniProfileCommandService } from "./alumni-profile-command.service";

describe("AlumniProfileCommandService", () => {
  const createService = () => {
    const alumniRepo = {
      upsertAlumniProfile: jest.fn(),
      toggleHelpfulReaction: jest.fn(),
      updateAvatarUrl: jest.fn(),
    } as unknown as AlumniProfileRepositoryPort;
    const accountRepo = {
      findUserById: jest.fn(),
    } as unknown as AccountRepositoryPort;
    const storage = {
      extractKeyFromUrl: jest.fn(),
      deleteObject: jest.fn(),
    } as unknown as StoragePort;

    const service = new AlumniProfileCommandService(alumniRepo, accountRepo, storage);
    return { service, alumniRepo, accountRepo, storage };
  };

  it("maps domain validation error to BadRequestException", async () => {
    const { service, alumniRepo, accountRepo } = createService();

    (accountRepo.findUserById as jest.Mock).mockResolvedValue({
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

    expect(alumniRepo.upsertAlumniProfile).not.toHaveBeenCalled();
  });

  it("delegates normalized values to repository", async () => {
    const { service, alumniRepo, accountRepo } = createService();

    (accountRepo.findUserById as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "fallback@example.com",
    });
    (alumniRepo.upsertAlumniProfile as jest.Mock).mockResolvedValue({ id: "p1" });

    await service.updateAlumniProfile("u1", {
      graduationYear: 2027,
      department: "IT_EXPERT",
      nickname: " taro ",
      companyExperiences: [
        {
          companyName: " ACME ",
          isPublic: true,
          motivation: " good fit ",
        },
      ],
      companyNames: [],
      xUrl: " https://x.com/taro ",
      skills: [" React ", "Node", "React", "TypeScript"],
      activityPeriod: "SECOND_YEAR_FIRST_HALF",
      isPublic: true,
      acceptContact: true,
      portfolioUrl: " https://example.com ",
    } satisfies UpdateAlumniProfileInput);

    expect(alumniRepo.upsertAlumniProfile).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        nickname: "taro",
        companyNames: ["ACME"],
        contactEmail: "fallback@example.com",
        xUrl: "https://x.com/taro",
        skills: ["React", "Node", "TypeScript"],
        portfolioUrl: "https://example.com",
      }),
    );
  });

  it("throws BadRequestException when toggling reaction for missing user", async () => {
    const { service, accountRepo } = createService();
    (accountRepo.findUserById as jest.Mock).mockResolvedValue(null);

    await expect(service.toggleHelpfulReaction("u1", "p1")).rejects.toThrow(BadRequestException);
  });

  it("deletes the previous avatar best-effort after updateAvatar", async () => {
    const { service, alumniRepo, accountRepo, storage } = createService();
    (accountRepo.findUserById as jest.Mock).mockResolvedValue({
      id: "u1",
      alumniProfile: { avatarUrl: "https://cdn.example.com/avatars/old.png" },
    });
    (alumniRepo.updateAvatarUrl as jest.Mock).mockResolvedValue({ id: "p1" });
    (storage.extractKeyFromUrl as jest.Mock).mockReturnValue("avatars/old.png");
    (storage.deleteObject as jest.Mock).mockResolvedValue(undefined);

    await service.updateAvatar("u1", " https://cdn.example.com/avatars/new.png ");

    expect(alumniRepo.updateAvatarUrl).toHaveBeenCalledWith(
      "u1",
      "https://cdn.example.com/avatars/new.png",
    );
    expect(storage.deleteObject).toHaveBeenCalledWith("avatars/old.png");
  });
});
