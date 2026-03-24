import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, DocumentItem } from '../../services/api';

@Component({
  selector: 'app-documents',
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents {
  documents: DocumentItem[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private api: Api,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getDocuments().subscribe({
      next: (docs) => {
        this.ngZone.run(() => {
          this.documents = docs;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorMessage = 'No se pudo obtener la lista de documentos.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
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
