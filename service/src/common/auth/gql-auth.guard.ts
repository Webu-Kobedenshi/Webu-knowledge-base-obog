import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Role, type User, UserStatus } from "@prisma/client";
import { jwtVerify } from "jose";
import { PrismaService } from "../../prisma.service";

const DEFAULT_AUTHORIZED_DOMAIN = "st.kobedenshi.ac.jp";
const SCHOOL_EMAIL_DOMAIN = "st.kobedenshi.ac.jp";
const TEACHER_EMAIL_LOCAL_PART_PATTERN = /^[a-z][a-z._-]*$/;

type AuthPayload = {
  sub?: string;
  email?: string;
  name?: string;
  role?: "STUDENT" | "ALUMNI" | "ADMIN";
};

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private getSecret(): Uint8Array {
    const secret = process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new UnauthorizedException("Authentication is not configured");
    }

    return new TextEncoder().encode(secret);
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private isTeacherEmailFormat(email: string): boolean {
    const [localPart, domain, ...rest] = email.split("@");
    return (
      rest.length === 0 &&
      domain === SCHOOL_EMAIL_DOMAIN &&
      TEACHER_EMAIL_LOCAL_PART_PATTERN.test(localPart)
    );
  }

  private isAllowedDomain(email: string): boolean {
    const allowedDomainsRaw = process.env.AUTH_ALLOWED_DOMAINS?.trim() || DEFAULT_AUTHORIZED_DOMAIN;
    const allowedDomains = allowedDomainsRaw
      .split(",")
      .map((item) => item.trim().toLowerCase().replace(/^@/, ""))
      .filter(Boolean);

    return allowedDomains.some((domain) => email.endsWith(`@${domain}`));
  }

  private async isAdminEmail(email: string): Promise<boolean> {
    const record = await this.prisma.adminEmail.findUnique({
      where: { email },
      select: { id: true },
    });

    return Boolean(record);
  }

  private async findOrCreateUser(payload: Required<Pick<AuthPayload, "email">> & AuthPayload) {
    const email = this.normalizeEmail(payload.email);
    const isAdmin = await this.isAdminEmail(email);
    const isAllowed = this.isAllowedDomain(email);
    const isTeacherEmail = this.isTeacherEmailFormat(email);

    if (email.endsWith("@gmail.com")) {
      const linkedUser = await this.prisma.user.findUnique({
        where: { linkedGmail: email },
      });

      if (linkedUser) {
        return linkedUser;
      }
    }

    if (isTeacherEmail && !isAdmin) {
      throw new UnauthorizedException("Email is not allowed");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (isAdmin && existing.role !== Role.ADMIN) {
        return this.prisma.user.update({
          where: { id: existing.id },
          data: { role: Role.ADMIN },
        });
      }

      return existing;
    }

    if (!isAllowed && !isAdmin) {
      throw new UnauthorizedException("Email is not allowed");
    }

    if (isAdmin) {
      return this.prisma.user.create({
        data: {
          email,
          name: payload.name,
          role: Role.ADMIN,
          status: UserStatus.ENROLLED,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        name: payload.name,
        role: Role.STUDENT,
        status: UserStatus.ENROLLED,
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext<{
      req?: {
        headers?: Record<string, string | string[] | undefined>;
        user?: User;
      };
    }>();
    const headerValue = ctx.req?.headers?.authorization;
    const authorization = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authentication required");
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException("Authentication required");
    }

    let payload: AuthPayload;
    try {
      const verified = await jwtVerify(token, this.getSecret(), {
        algorithms: ["HS256"],
      });
      payload = verified.payload as AuthPayload;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    const email = payload.email;
    if (!email) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await this.findOrCreateUser({
      ...payload,
      email,
    });

    if (ctx.req) {
      ctx.req.user = user;
    }

    return true;
  }
}
