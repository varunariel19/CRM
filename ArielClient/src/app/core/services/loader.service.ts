import { Injectable, signal } from '@angular/core';

export type LoaderSize = 'sm' | 'md' | 'lg';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  isVisible = signal(false);
  message = signal('');
  size = signal<LoaderSize>('md');

  show(message?: string, size: LoaderSize = 'md'): void {
    this.message.set(message ?? '');
    this.size.set(size);
    this.isVisible.set(true);
  }

  hide(): void {
    this.isVisible.set(false);
    this.message.set('');
  }
}