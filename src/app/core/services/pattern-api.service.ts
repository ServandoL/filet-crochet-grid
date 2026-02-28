import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreatePatternDto,
  Pattern,
  UpdatePatternDto,
} from '../models/pattern.model';

@Injectable({ providedIn: 'root' })
export class PatternApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/patterns`;

  getPatterns() {
    return this.http.get<Pattern[]>(this.base);
  }

  getPattern(id: string) {
    return this.http.get<Pattern>(`${this.base}/${id}`);
  }

  createPattern(dto: CreatePatternDto) {
    return this.http.post<Pattern>(this.base, dto);
  }

  updatePattern(id: string, dto: UpdatePatternDto) {
    return this.http.patch<Pattern>(`${this.base}/${id}`, dto);
  }

  deletePattern(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

