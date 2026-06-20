import { Inject, Injectable } from "@nestjs/common";
import type { Department } from "../../../../common/domain/department";
import type {
  AlumniConnectionDto,
  AlumniListConnectionDto,
  AlumniProfileDto,
} from "../dto/alumni.dto";
import {
  ALUMNI_PROFILE_REPOSITORY,
  type AlumniProfileRepositoryPort,
} from "../ports/alumni-profile-repository.port";

@Injectable()
export class AlumniQueryService {
  constructor(
    @Inject(ALUMNI_PROFILE_REPOSITORY)
    private readonly alumniProfileRepository: AlumniProfileRepositoryPort,
  ) {}

  getAlumniList(params: {
    department?: Department;
    company?: string;
    graduationYear?: number;
    limit: number;
    offset: number;
  }): Promise<AlumniConnectionDto> {
    return this.alumniProfileRepository.findPublicList(params);
  }

  getAlumniListItems(params: {
    department?: Department;
    company?: string;
    graduationYear?: number;
    limit: number;
    offset: number;
  }): Promise<AlumniListConnectionDto> {
    return this.alumniProfileRepository.findPublicListItems(params);
  }

  getCompanyNameSuggestions(query: string, limit = 8): Promise<string[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return Promise.resolve([]);
    }

    return this.alumniProfileRepository.findPublicCompanyNameSuggestions(normalizedQuery, limit);
  }

  getAlumniDetail(id: string, viewerUserId?: string): Promise<AlumniProfileDto | null> {
    return viewerUserId
      ? this.alumniProfileRepository.findPublicById(id, viewerUserId)
      : this.alumniProfileRepository.findPublicById(id);
  }
}
