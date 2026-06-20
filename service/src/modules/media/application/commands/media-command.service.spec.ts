import { BadRequestException } from "@nestjs/common";
import type { StoragePort } from "../ports/storage.port";
import { MediaCommandService } from "./media-command.service";

describe("MediaCommandService", () => {
  const createService = () => {
    const storage = {
      createPutUploadUrl: jest.fn(),
    } as unknown as StoragePort;

    const service = new MediaCommandService(storage);
    return { service, storage };
  };

  it("delegates normalized image upload URL params to storage", async () => {
    const { service, storage } = createService();
    const expected = {
      uploadUrl: "https://upload.example.com",
      fileUrl: "https://cdn.example.com/avatar.png",
      key: "avatars/u1/avatar.png",
    };
    (storage.createPutUploadUrl as jest.Mock).mockResolvedValue(expected);

    const result = await service.getUploadUrl("u1", " avatar.png ", " image/png ");

    expect(storage.createPutUploadUrl).toHaveBeenCalledWith({
      userId: "u1",
      fileName: "avatar.png",
      contentType: "image/png",
    });
    expect(result).toEqual(expected);
  });

  it("throws BadRequestException for non-image content type", () => {
    const { service } = createService();

    expect(() => service.getUploadUrl("u1", "avatar.txt", "text/plain")).toThrow(
      BadRequestException,
    );
  });
});
