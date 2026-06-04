import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SidebarComponent } from "../../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../../shared/header/header.component";
import { DashboardComponent } from '../../../layout/dashboard/dashboard.component';
import { ConfirmationModalComponent } from "../../../shared/modals/confirmation-modal/confirmation-modal.component";
import { GlobalLoaderComponent } from "../../../shared/global-loader/global-loader.component";

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, HeaderComponent, DashboardComponent, ConfirmationModalComponent, GlobalLoaderComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css',
})
export class RootComponent {

   isSidebarCollapsed = false;
   isDarkTheme = true;
   private readonly themeStorageKey = 'crm-theme';

   constructor(@Inject(DOCUMENT) private readonly document: Document) {
      this.isDarkTheme = this.readSavedTheme();
      this.applyTheme(this.isDarkTheme);
   }

   toggleTheme(): void {
      this.isDarkTheme = !this.isDarkTheme;
      this.applyTheme(this.isDarkTheme);
      this.saveTheme(this.isDarkTheme);
   }

   private readSavedTheme(): boolean {
      try {
         const savedTheme = localStorage.getItem(this.themeStorageKey);
         if (savedTheme === 'light') {
            return false;
         }

         if (savedTheme === 'dark') {
            return true;
         }
      } catch {
         return true;
      }

      return true;
   }

   private applyTheme(isDarkTheme: boolean): void {
      const body = this.document.body;

      body.classList.toggle('theme-dark', isDarkTheme);
      body.classList.toggle('theme-light', !isDarkTheme);
      body.dataset['theme'] = isDarkTheme ? 'dark' : 'light';
   }

   private saveTheme(isDarkTheme: boolean): void {
      try {
         localStorage.setItem(this.themeStorageKey, isDarkTheme ? 'dark' : 'light');
      } catch {
         // Ignore persistence failures and keep the active theme in memory.
      }
   }
}
