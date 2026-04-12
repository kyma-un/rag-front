import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Api, AskResponse, RagMode } from '../../services/api';

type ManualSourceSelection = 'all' | 'selected';

type AssistantMessage = {
  id: number;
  role: 'assistant';
  answer: string;
  mode: RagMode | string;
  selectedSources: string[] | null;
  numSources: number | null;
  responseTime: number | null;
};

type UserMessage = {
  id: number;
  role: 'user';
  text: string;
};

type ChatMessage = UserMessage | AssistantMessage;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chat implements OnInit {
  private readonly api = inject(Api);
  private nextMessageId = 0;

  readonly messages = signal<ChatMessage[]>([]);
  readonly inputText = signal('');
  readonly mode = signal<RagMode>('manual');
  readonly manualSourceSelection = signal<ManualSourceSelection>('all');
  readonly selectedSources = signal<string[]>([]);
  readonly supportedSources = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly isSourcesLoading = signal(false);
  readonly sourceLoadError = signal('');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly k = 5;

  readonly canSend = computed(() => {
    const question = this.inputText().trim();

    if (!question || this.isLoading()) {
      return false;
    }

    if (this.mode() === 'auto') {
      return true;
    }

    if (this.manualSourceSelection() === 'all') {
      return true;
    }

    return this.selectedSources().length > 0;
  });

  readonly hasManualSourceError = computed(
    () => this.mode() === 'manual' && this.manualSourceSelection() === 'selected' && this.selectedSources().length === 0
  );

  ngOnInit(): void {
    this.loadSources();
  }

  loadSources(): void {
    this.isSourcesLoading.set(true);
    this.sourceLoadError.set('');

    this.api.getSources().subscribe({
      next: (response) => {
        this.supportedSources.set(response.supported_sources);

        if (this.manualSourceSelection() === 'selected') {
          this.selectedSources.update((currentSelection) =>
            currentSelection.filter((source) => response.supported_sources.includes(source))
          );
        }

        this.isSourcesLoading.set(false);
      },
      error: () => {
        this.sourceLoadError.set('No se pudieron cargar las fuentes disponibles.');
        this.isSourcesLoading.set(false);
      },
    });
  }

  setMode(mode: RagMode): void {
    this.mode.set(mode);

    if (mode === 'auto') {
      this.manualSourceSelection.set('all');
      this.selectedSources.set([]);
    }
  }

  setManualSourceSelection(selection: ManualSourceSelection): void {
    this.manualSourceSelection.set(selection);

    if (selection === 'all') {
      this.selectedSources.set([]);
    }
  }

  toggleSource(source: string, checked: boolean): void {
    this.manualSourceSelection.set('selected');

    this.selectedSources.update((currentSelection) => {
      if (checked) {
        return currentSelection.includes(source) ? currentSelection : [...currentSelection, source];
      }

      return currentSelection.filter((currentSource) => currentSource !== source);
    });
  }

  updateQuestion(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.inputText.set(target.value);
  }

  handleQuestionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.canSend()) {
      this.errorMessage.set('Selecciona al menos una fuente o usa la opción Todas.');
      return;
    }

    const question = this.inputText().trim();
    const selectedSources = this.mode() === 'auto' || this.manualSourceSelection() === 'all' ? null : [...this.selectedSources()];

    this.messages.update((currentMessages) => [
      ...currentMessages,
      {
        id: this.nextMessageId++,
        role: 'user',
        text: question,
      },
    ]);

    this.inputText.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    this.api.query({
      question,
      mode: this.mode(),
      sources: selectedSources,
      k: this.k,
    }).subscribe({
      next: (response: AskResponse) => {
        this.messages.update((currentMessages) => [
          ...currentMessages,
          {
            id: this.nextMessageId++,
            role: 'assistant',
            answer: response.answer,
            mode: response.mode ?? this.mode(),
            selectedSources: this.normalizeSelectedSources(response.selected_sources, selectedSources),
            numSources: typeof response.num_sources === 'number' ? response.num_sources : null,
            responseTime: typeof response.response_time === 'number' ? response.response_time : null,
          },
        ]);

        this.successMessage.set('Respuesta recibida correctamente.');
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update((currentMessages) => [
          ...currentMessages,
          {
            id: this.nextMessageId++,
            role: 'assistant',
            answer: 'No se pudo obtener la respuesta. Verifica que el backend este disponible e intenta de nuevo.',
            mode: this.mode(),
            selectedSources,
            numSources: null,
            responseTime: null,
          },
        ]);

        this.errorMessage.set('Error al consultar la API. Revisa la conexión con el backend.');
        this.isLoading.set(false);
      },
    });
  }

  isSourceSelected(source: string): boolean {
    return this.selectedSources().includes(source);
  }

  private normalizeSelectedSources(responseSources: string[] | null | undefined, fallbackSources: string[] | null): string[] | null {
    if (responseSources === null) {
      return null;
    }

    if (Array.isArray(responseSources)) {
      return responseSources;
    }

    return fallbackSources;
  }
}
