import { computed, inject, Injectable, signal } from '@angular/core';
import { menuItems } from '../core/constants/menuItems';
import { PermissionService } from '../core/services/permission.service';

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

  private permissionService = inject(PermissionService);

  readonly menus = computed(() =>
    menuItems.filter(menu =>
      this.permissionService.has(menu.permission)
    )
  );

  activeIndex = signal(0);
  menuHistory = signal<number[]>([]);

  readonly selectedMenu = computed(() => {
    const menus = this.menus();
    const index = Math.min(this.activeIndex(), menus.length - 1);
    return menus[index] ?? null;
  });

  setActiveMenu(index: number) {
    this.activeIndex.set(index);
  }

  setActiveMenuByRoute(route: string): boolean {
    const index = this.menus().findIndex(menu => menu.route === route);
    if (index < 0) return false;

    this.setActiveMenu(index);
    return true;
  }

  setMenuHistory(index: number) {
    this.menuHistory.update(prev => [...prev, index]);
  }

  popHistory() {
    this.menuHistory.update(prev => prev.slice(0, -1));
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
