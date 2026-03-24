import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface DocumentItem {
    id?: string;
    filename: string;
    size?: number;
    uploadedAt?: string;
    status?: string;
}

interface DocumentsResponse {
  documents?: DocumentItem[];
}

interface UploadDocumentResponse {
  status: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://localhost:8000'; // Cambia esto a la URL de tu backend
  constructor(private http: HttpClient) {}
  
  query(question: string) {
    return this.http.post(`${this.apiUrl}/ask`, { question });
  }

  getDocuments(): Observable<DocumentItem[]> {
    return this.http
      .get<DocumentItem[] | DocumentsResponse>(`${this.apiUrl}/documents`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.documents ?? [])));
  }

  uploadDocument(file: File): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadDocumentResponse>(`${this.apiUrl}/documents/upload`, formData);
  }
}

