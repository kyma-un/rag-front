import { Component } from '@angular/core';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  standalone: true,
})
export class Chat {
  messages: any[] = [];
  inputText: string = '';
  isLoading: boolean = false;

  constructor(
    private api: Api,
    private cdr: ChangeDetectorRef
  ) {}

  sendMessage() {
    if (!this.inputText.trim() || this.isLoading) return;

    // 1. Se guarda la pregunta del usuario en el array de mensajes
    const question = this.inputText;

    this.messages.push({ text: question, role: 'user' });

    this.inputText = '';
    this.isLoading = true;

    // 2. Se hace la consulta a la API
    this.api.query(question).subscribe({
      next: (response: any) => {   
        // 3. Se guarda la respuesta del asistente en el array de mensajes
        this.messages.push({ text: response.answer, role: 'assistant' });
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log("Respuesta recibida:", response);
      },
      error: (err) => {
        console.error('Error al obtener la respuesta:', err);
        this.messages.push({ text: 'Error al obtener la respuesta. Por favor, inténtalo de nuevo.', role: 'assistant' });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
