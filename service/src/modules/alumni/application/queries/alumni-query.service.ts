import { Inject, Injectable } from "@nestjs/common";
import type { Department } from "../../domain/types/department";
import { resolveRoleAndStatus } from "../../domain/user-role-transition";
import type {
  AlumniConnectionDto,
  AlumniListConnectionDto,
  AlumniProfileDto,
  UserDto,
} from "../dto/alumni.dto";
import { ALUMNI_REPOSITORY, type AlumniRepositoryPort } from "../ports/alumni-repository.port";

@Injectable()
export class AlumniQueryService {
  constructor(@Inject(ALUMNI_REPOSITORY) private readonly alumniRepository: AlumniRepositoryPort) {}

  getAlumniList(params: {
    department?: Department;
    company?: string;
    graduationYear?: number;
    limit: number;
    offset: number;
  }): Promise<AlumniConnectionDto> {
    return this.alumniRepository.findPublicList(params);
  }

  getAlumniListItems(params: {
    department?: Department;
    company?: string;
    graduationYear?: number;
    limit: number;
    offset: number;
  }): Promise<AlumniListConnectionDto> {
    return this.alumniRepository.findPublicListItems(params);
  }

  getCompanyNameSuggestions(query: string, limit = 8): Promise<string[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return Promise.resolve([]);
    }

    return this.alumniRepository.findPublicCompanyNameSuggestions(normalizedQuery, limit);
  }

  getAlumniDetail(id: string, viewerUserId?: string): Promise<AlumniProfileDto | null> {
    return viewerUserId
      ? this.alumniRepository.findPublicById(id, viewerUserId)
      : this.alumniRepository.findPublicById(id);
  }

  async getMyProfile(userId: string): Promise<UserDto | null> {
    const profile = await this.alumniRepository.findUserById(userId);
    if (!profile) {
      return null;
    }

    if (profile.role === "ADMIN") {
      return profile;
    }

    if (profile.enrollmentYear && profile.durationYears) {
      const resolved = resolveRoleAndStatus({
        enrollmentYear: profile.enrollmentYear,
        durationYears: profile.durationYears,
      });

      if (profile.role !== resolved.role || profile.status !== resolved.status) {
        return {
          ...profile,
          role: resolved.role,
          status: resolved.status,
        };
      }
    }

    return profile;
  }

  findUserByLinkedGmail(gmail: string): Promise<UserDto | null> {
    return this.alumniRepository.findUserByLinkedGmail(gmail);
  }

  isAdminEmail(email: string): Promise<boolean> {
    return this.alumniRepository.isAdminEmail(email);
  }
}
