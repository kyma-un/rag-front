import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Api } from '../../services/api';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.html',
  styleUrl: './upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Upload {
  private readonly api = inject(Api);

  readonly selectedFile = signal<File | null>(null);
  readonly isUploading = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedFile.set(target.files?.[0] ?? null);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  upload(fileInput: HTMLInputElement): void {
    const file = this.selectedFile();

    if (!file || this.isUploading()) {
      return;
    }

    this.isUploading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.api.uploadDocument(file).subscribe({
      next: (response) => {
        this.successMessage.set(response.message ?? `Archivo "${file.name}" cargado correctamente.`);
        this.selectedFile.set(null);
        fileInput.value = '';
        this.isUploading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el archivo. Revisa que el backend este disponible.');
        this.isUploading.set(false);
      }
    });
  }
}
