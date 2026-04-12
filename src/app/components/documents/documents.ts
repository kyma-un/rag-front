import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, DocumentItem } from '../../services/api';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.html',
  styleUrl: './documents.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Documents implements OnInit {
  private readonly api = inject(Api);

  readonly documents = signal<DocumentItem[]>([]);
  readonly supportedSources = signal<string[]>([]);
  readonly indexedSources = signal<string[]>([]);
  readonly isLoadingDocuments = signal(false);
  readonly isLoadingSources = signal(false);
  readonly errorMessage = signal('');
  readonly sourceErrorMessage = signal('');
  readonly ingestMessage = signal('');
  readonly ingestErrorMessage = signal('');
  readonly ingestTarget = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDocuments();
    this.loadSources();
  }

  loadDocuments(): void {
    this.isLoadingDocuments.set(true);
    this.errorMessage.set('');

    this.api.getDocuments().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.isLoadingDocuments.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo obtener la lista de documentos.');
        this.isLoadingDocuments.set(false);
      },
    });
  }

  loadSources(): void {
    this.isLoadingSources.set(true);
    this.sourceErrorMessage.set('');

    this.api.getSources().subscribe({
      next: (sources) => {
        this.supportedSources.set(sources.supported_sources);
        this.indexedSources.set(sources.indexed_sources);
        this.isLoadingSources.set(false);
      },
      error: () => {
        this.sourceErrorMessage.set('No se pudieron obtener las fuentes disponibles.');
        this.isLoadingSources.set(false);
      },
    });
  }

  ingestSources(sources: string[] | null): void {
    if (this.ingestTarget() !== null) {
      return;
    }

    this.ingestTarget.set(sources === null ? 'all' : sources.join(', '));
    this.ingestMessage.set('');
    this.ingestErrorMessage.set('');

    this.api.ingestSources({ sources }).subscribe({
      next: (response) => {
        this.ingestMessage.set(response.message ?? 'Ingesta solicitada correctamente.');
        this.ingestTarget.set(null);
        this.loadDocuments();
        this.loadSources();
      },
      error: () => {
        this.ingestErrorMessage.set('No se pudo iniciar la ingesta de fuentes.');
        this.ingestTarget.set(null);
      },
    });
  }

  formatBytes(size?: number): string {
    if (!size || size <= 0) {
      return 'N/A';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }
}
