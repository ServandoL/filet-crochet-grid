import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {CreatePatternDto, Pattern, Progress, UpdatePatternDto, UpsertProgressDto} from '../models/pattern.model';

@Injectable({providedIn: 'root'})
export class PatternApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/patterns`;

  getPatterns() {
    return this.http.get<Pattern[]>(this.base);
  }

  getPattern(id: string) {
    return this.http.get<Pattern>(`${this.base}/${id}`);
  }

  createPattern(dto: CreatePatternDto) {
    const time = new Date().toISOString();
    const pattern = {
      cells: [],
      cols: dto.cols,
      createdAt: time,
      name: dto.name,
      rows: dto.rows,
      updatedAt: time
    };
    return this.http.post<Pattern>(this.base, pattern);
  }

  updatePattern(id: string, dto: UpdatePatternDto) {
    return this.http.patch<Pattern>(`${this.base}/${id}`, dto);
  }

  deletePattern(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getProgress(patternId: string) {
    return this.http.get<Progress>(`${this.base}/${patternId}/progress`);
  }

  upsertProgress(patternId: string, dto: UpsertProgressDto) {
    return this.http.put<Progress>(`${this.base}/${patternId}/progress`, dto);
  }

  deleteProgress(patternId: string) {
    return this.http.delete<void>(`${this.base}/${patternId}/progress`);
  }
}
