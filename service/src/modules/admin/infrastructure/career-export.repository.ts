import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma.service";
import type { CareerExportRowDto } from "../application/dto/career-export.dto";
import type { CareerExportRepositoryPort } from "../application/ports/career-export-repository.port";

@Injectable()
export class CareerExportRepository implements CareerExportRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findCareerExportRows(): Promise<CareerExportRowDto[]> {
    const profiles = await this.prisma.alumniProfile.findMany({
      select: {
        graduationYear: true,
        department: true,
        activityPeriod: true,
        gakuchika: true,
        user: {
          select: {
            studentId: true,
            name: true,
          },
        },
        companies: {
          select: {
            companyName: true,
            motivation: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
    });

    return profiles.flatMap((profile) =>
      profile.companies.map((company) => ({
        studentId: profile.user.studentId,
        fullName: profile.user.name,
        department: profile.department,
        graduationYear: profile.graduationYear,
        companyName: company.companyName,
        companyMotivation: company.motivation,
        activityPeriod: profile.activityPeriod,
        gakuchika: profile.gakuchika,
      })),
    );
  }
}
