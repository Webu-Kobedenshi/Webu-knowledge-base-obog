import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { AuthenticatedUser } from "./current-user.decorator";

@Injectable()
export class GqlAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext<{
      req?: { user?: AuthenticatedUser };
    }>();

    if (ctx.req?.user?.role !== "ADMIN") {
      throw new ForbiddenException("Admin role is required");
    }

    return true;
  }
}
