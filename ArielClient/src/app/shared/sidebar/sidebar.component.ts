import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MenuState } from '../../state/menu.state';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {

  @Input() collapsed = false;

  menuState = inject(MenuState);

  activeIndex = this.menuState.activeIndex;
  selectedMenu = this.menuState.selectedMenu;

  get sidebarMenus() {
    return this.menuState.menus();
  }

  setActiveMenu(index: number) {
    this.menuState.setActiveMenu(index);
  }
}