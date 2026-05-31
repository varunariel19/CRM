import { Injectable, signal } from '@angular/core';
import { menuItems } from '../core/constants/menuItems';
export interface ConfirmationModalConfig {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class MenuState {

  menus = signal(menuItems);
  activeIndex = signal(0);
  selectedMenu = signal(menuItems[0]);


  setActiveMenu(index: number) {
    this.activeIndex.set(index);
    this.selectedMenu.set(this.menus()[index]);
  }

  isOpen = signal(false);

  config = signal<ConfirmationModalConfig>({
    title: '',
    message: '',
  });

  open(config: ConfirmationModalConfig) {
    this.config.set(config);
    this.isOpen.set(true);
  }

  confirm() {
    this.config().onConfirm?.();
    this.close();
  }

  cancel() {
    this.config().onCancel?.();
    this.close();
  }

  close() {
    this.isOpen.set(false);
  }

}