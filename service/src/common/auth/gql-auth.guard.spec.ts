import { UnauthorizedException } from "@nestjs/common";
import { Role, UserStatus } from "@prisma/client";
import { GqlAuthGuard } from "./gql-auth.guard";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

type AuthPayload = {
  email: string;
  name?: string;
  role?: "STUDENT" | "ALUMNI" | "ADMIN";
};

function createPrismaMock() {
  return {
    adminEmail: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

describe("GqlAuthGuard admin email handling", () => {
  const originalAllowedDomains = process.env.AUTH_ALLOWED_DOMAINS;

  afterEach(() => {
    if (originalAllowedDomains === undefined) {
      process.env.AUTH_ALLOWED_DOMAINS = undefined;
    } else {
      process.env.AUTH_ALLOWED_DOMAINS = originalAllowedDomains;
    }
    jest.restoreAllMocks();
  });

  const findOrCreateUser = (guard: GqlAuthGuard, payload: AuthPayload) =>
    (
      guard as unknown as {
        findOrCreateUser(input: AuthPayload): Promise<unknown>;
      }
    ).findOrCreateUser(payload);

  it("creates an ADMIN user when the email is registered as admin", async () => {
    process.env.AUTH_ALLOWED_DOMAINS = "st.kobedenshi.ac.jp";
    const prisma = createPrismaMock();
    prisma.adminEmail.findUnique.mockResolvedValue({ id: "admin-email-1" });
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: "u1", ...data }));
    const guard = new GqlAuthGuard(prisma as never);

    const result = await findOrCreateUser(guard, {
      email: "Teacher@Example.com ",
      name: "Teacher",
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "teacher@example.com",
        name: "Teacher",
        role: Role.ADMIN,
        status: UserStatus.ENROLLED,
      },
    });
    expect(result).toEqual(
      expect.objectContaining({
        email: "teacher@example.com",
        role: Role.ADMIN,
      }),
    );
  });

  it("upgrades an existing user to ADMIN when the email is registered as admin", async () => {
    process.env.AUTH_ALLOWED_DOMAINS = "st.kobedenshi.ac.jp";
    const prisma = createPrismaMock();
    const existingUser = {
      id: "u1",
      email: "teacher@example.com",
      role: Role.STUDENT,
    };
    const adminUser = {
      ...existingUser,
      role: Role.ADMIN,
    };
    prisma.adminEmail.findUnique.mockResolvedValue({ id: "admin-email-1" });
    prisma.user.findUnique.mockResolvedValue(existingUser);
    prisma.user.update.mockResolvedValue(adminUser);
    const guard = new GqlAuthGuard(prisma as never);

    const result = await findOrCreateUser(guard, {
      email: "teacher@example.com",
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { role: Role.ADMIN },
    });
    expect(result).toEqual(adminUser);
  });

  it("rejects emails outside allowed domains when they are not registered as admin", async () => {
    process.env.AUTH_ALLOWED_DOMAINS = "st.kobedenshi.ac.jp";
    const prisma = createPrismaMock();
    prisma.adminEmail.findUnique.mockResolvedValue(null);
    const guard = new GqlAuthGuard(prisma as never);

    await expect(
      findOrCreateUser(guard, {
        email: "outsider@example.com",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects teacher-format school emails when they are not registered as admin", async () => {
    process.env.AUTH_ALLOWED_DOMAINS = "st.kobedenshi.ac.jp";
    const prisma = createPrismaMock();
    prisma.adminEmail.findUnique.mockResolvedValue(null);
    const guard = new GqlAuthGuard(prisma as never);

    await expect(
      findOrCreateUser(guard, {
        email: "shiki@st.kobedenshi.ac.jp",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("accepts a linked Gmail even when gmail.com is not an allowed domain", async () => {
    process.env.AUTH_ALLOWED_DOMAINS = "st.kobedenshi.ac.jp";
    const prisma = createPrismaMock();
    const linkedUser = {
      id: "u1",
      email: "24a0001@st.kobedenshi.ac.jp",
      linkedGmail: "linked@gmail.com",
      role: Role.STUDENT,
    };
    prisma.adminEmail.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(linkedUser);
    const guard = new GqlAuthGuard(prisma as never);

    const result = await findOrCreateUser(guard, {
      email: "linked@gmail.com",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { linkedGmail: "linked@gmail.com" },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(result).toEqual(linkedUser);
  });

  it("does not trust an ADMIN role claim unless the email is registered as admin", async () => {
    process.env.AUTH_ALLOWED_DOMAINS = "st.kobedenshi.ac.jp";
    const prisma = createPrismaMock();
    prisma.adminEmail.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: "u1", ...data }));
    const guard = new GqlAuthGuard(prisma as never);

    await findOrCreateUser(guard, {
      email: "24a0001@st.kobedenshi.ac.jp",
      role: "ADMIN",
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "24a0001@st.kobedenshi.ac.jp",
        name: undefined,
        role: Role.STUDENT,
        status: UserStatus.ENROLLED,
      },
    });
  });
});
