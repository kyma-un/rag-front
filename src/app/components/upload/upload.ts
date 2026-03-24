import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  imports: [CommonModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {
  selectedFile: File | null = null;
  isUploading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private api: Api,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  upload(): void {
    if (!this.selectedFile || this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.api.uploadDocument(this.selectedFile).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `Archivo "${this.selectedFile?.name}" cargado correctamente.`;
          this.selectedFile = null;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorMessage = 'No se pudo cargar el archivo. Revisa que el backend este disponible.';
          this.isUploading = false;
          this.cdr.detectChanges();
        });
      },
      complete: () => {
        this.ngZone.run(() => {
          this.isUploading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
}
