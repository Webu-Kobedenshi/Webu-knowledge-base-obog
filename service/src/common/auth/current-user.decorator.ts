import { type ExecutionContext, UnauthorizedException, createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
  studentId?: string | null;
  linkedGmail?: string | null;
  role?: "STUDENT" | "ALUMNI" | "ADMIN";
  status?: "ENROLLED" | "GRADUATED" | "WITHDRAWN";
  enrollmentYear?: number | null;
  durationYears?: number | null;
  department?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<{
    req?: { user?: AuthenticatedUser };
  }>();
  const user = ctx.req?.user;

  if (!user) {
    throw new UnauthorizedException("Authentication required");
  }

  return user;
});
