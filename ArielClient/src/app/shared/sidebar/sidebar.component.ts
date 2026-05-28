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

  sidebarMenus = this.menuState.menus;
  activeIndex = this.menuState.activeIndex;
  selectedMenu = this.menuState.selectedMenu;

  setActiveMenu(index: number) {
    this.menuState.setActiveMenu(index);
  }

}