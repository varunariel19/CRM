import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MenuState } from '../../state/menu.state';
import { Router } from '@angular/router';
import { MenuItem } from '../../core/constants/menuItems';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {

  @Input() collapsed = false;

  menuState = inject(MenuState);
  router = inject(Router);

  activeIndex = this.menuState.activeIndex;
  selectedMenu = this.menuState.selectedMenu;

  get sidebarMenus() {
    return this.menuState.menus();
  }

  setActiveMenu(item: MenuItem) {
    this.router.navigate(['/dashboard', item.route]);

    const index = this.sidebarMenus.findIndex(menu => menu.route === item.route);
    if (index >= 0) {
      this.menuState.setActiveMenu(index);
      this.menuState.setMenuHistory(index);
    }
  }
}
