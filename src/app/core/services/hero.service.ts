import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Hero, PageResult } from '../../models/hero.model';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly http = inject(HttpClient);
  private apiBaseUrl = '/api/heroes';

  generateId(): string {
    return crypto.randomUUID();
  }

  getAll(page: number, pageSize: number): Observable<PageResult> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PageResult>(this.apiBaseUrl, { params });
  }

  getById(id: string): Observable<Hero | undefined> {
    return this.http.get<Hero | null>(`${this.apiBaseUrl}/${id}`).pipe(
      map(hero => hero ?? undefined)
    );
  }

  search(searchText: string, page: number, pageSize: number): Observable<PageResult> {
    const params = new HttpParams().set('searchText', searchText).set('page', page).set('pageSize', pageSize);
    return this.http.get<PageResult>(this.apiBaseUrl, { params });
  }

  create(data: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.apiBaseUrl, data);
  }

  update(updated: Hero): Observable<Hero> {
    return this.http.put<Hero>(`${this.apiBaseUrl}/${updated.id}`, updated);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/${id}`);
  }
}
