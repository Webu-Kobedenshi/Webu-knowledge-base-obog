import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { GqlAdminGuard } from "./gql-admin.guard";

jest.mock("@nestjs/graphql", () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe("GqlAdminGuard", () => {
  const createContext = (role?: string | null) => {
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: () => ({
        req: {
          user: role ? { role } : undefined,
        },
      }),
    });

    return {} as ExecutionContext;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("allows admin users", () => {
    const guard = new GqlAdminGuard();

    expect(guard.canActivate(createContext("ADMIN"))).toBe(true);
  });

  it("rejects non-admin users", () => {
    const guard = new GqlAdminGuard();

    expect(() => guard.canActivate(createContext("STUDENT"))).toThrow(ForbiddenException);
  });
});
