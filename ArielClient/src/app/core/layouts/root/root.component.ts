import { afterNextRender, Component, effect, ElementRef, inject, Injector, ViewChild } from '@angular/core';
import { SidebarComponent } from "../../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../../shared/header/header.component";
import { DashboardComponent } from '../../../layout/dashboard/dashboard.component';
import { ConfirmationModalComponent } from "../../../shared/modals/confirmation-modal/confirmation-modal.component";
import { GlobalLoaderComponent } from "../../../shared/global-loader/global-loader.component";
import { AuditHistoryModalComponent } from "../../../components/history/history.component";
import { MenuState } from '../../../state/menu.state';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, HeaderComponent, DashboardComponent, ConfirmationModalComponent, GlobalLoaderComponent, AuditHistoryModalComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css',
})
export class RootComponent {
  @ViewChild('workspaceWrapper')
  workspaceWrapper!: ElementRef<HTMLDivElement>;

  isSidebarCollapsed = false;


  private injector = inject(Injector);
  private menuState = inject(MenuState);

  selectedMenu = this.menuState.selectedMenu;

  constructor() {
    effect(() => {
      this.selectedMenu();

      afterNextRender(() => {
        this.scrollToUp();
      }, { injector: this.injector });
    });
  }

  scrollToUp(): void {
    this.workspaceWrapper?.nativeElement.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }
}