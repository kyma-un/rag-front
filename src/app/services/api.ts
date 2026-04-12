import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type RagMode = 'manual' | 'auto';

export interface AskRequest {
  question: string;
  mode: RagMode;
  sources: string[] | null;
  k: number;
}

export interface AskResponse {
  answer: string;
  mode?: RagMode;
  selected_sources?: string[] | null;
  num_sources?: number;
  response_time?: number;
  [key: string]: unknown;
}

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

interface SourcesResponse {
  supported_sources?: unknown;
  indexed_sources?: unknown;
}

export interface SourcesViewModel {
  supported_sources: string[];
  indexed_sources: string[];
}

export interface IngestSourcesRequest {
  sources: string[] | null;
}

interface UploadDocumentResponse {
  status: string;
  message?: string;
}

interface IngestSourcesResponse {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://localhost:8000'; // Cambia esto a la URL de tu backend
  private readonly http = inject(HttpClient);
  
  query(body: AskRequest): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.apiUrl}/ask`, body);
  }

  getDocuments(): Observable<DocumentItem[]> {
    return this.http
      .get<DocumentItem[] | DocumentsResponse>(`${this.apiUrl}/documents`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.documents ?? [])));
  }

  getSources(): Observable<SourcesViewModel> {
    return this.http.get<SourcesResponse>(`${this.apiUrl}/sources`).pipe(
      map((response) => ({
        supported_sources: this.toStringArray(response.supported_sources),
        indexed_sources: this.toStringArray(response.indexed_sources),
      }))
    );
  }

  ingestSources(body: IngestSourcesRequest): Observable<IngestSourcesResponse> {
    return this.http.post<IngestSourcesResponse>(`${this.apiUrl}/documents/ingest-sources`, body);
  }

  uploadDocument(file: File): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadDocumentResponse>(`${this.apiUrl}/documents/upload`, formData);
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }
}

