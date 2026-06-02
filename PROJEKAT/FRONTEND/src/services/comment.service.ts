import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/entities';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly accessTokenKey = 'kc_access_token';

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

    return {
      withCredentials: true,
      ...(headers ? { headers } : {}),
    };
  }

  getComments(expenseId: string | number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${environment.apiUrl}/troskovi/${expenseId}/komentari`,
      this.getAuthOptions()
    );
  }

  addComment(expenseId: string | number, tekst: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${environment.apiUrl}/troskovi/${expenseId}/komentari`,
      { tekst },
      this.getAuthOptions()
    );
  }
}
