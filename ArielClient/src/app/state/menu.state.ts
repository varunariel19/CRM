import { Injectable, signal } from '@angular/core';
import { menuItems } from '../core/constants/menuItems';

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

}