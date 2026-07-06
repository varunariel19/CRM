import { afterNextRender, Component, effect, ElementRef, inject, Injector, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from "../../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../../shared/header/header.component";
import { DashboardComponent } from '../../../layout/dashboard/dashboard.component';
import { ConfirmationModalComponent } from "../../../shared/modals/confirmation-modal/confirmation-modal.component";
import { GlobalLoaderComponent } from "../../../shared/global-loader/global-loader.component";
import { AuditHistoryModalComponent } from "../../../components/history/history.component";
import { MenuState } from '../../../state/menu.state';
import { NotificationPanelComponent } from "../../../components/notification-panel/notification-panel.component";
import { NotificationToastComponent } from "../../../components/items/notification-toast/notification-toast.component";
import { DeepLinkService } from '../../services/deepLink.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, HeaderComponent, DashboardComponent, ConfirmationModalComponent, GlobalLoaderComponent, AuditHistoryModalComponent, NotificationPanelComponent, NotificationToastComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css',
})
export class RootComponent implements OnInit {
  @ViewChild('workspaceWrapper')
  workspaceWrapper!: ElementRef<HTMLDivElement>;

  isSidebarCollapsed = false;

  private injector = inject(Injector);
  private menuState = inject(MenuState);
  private deepLink = inject(DeepLinkService);
  private route = inject(ActivatedRoute);

  selectedMenu = this.menuState.selectedMenu;

  constructor() {
    effect(() => {
      this.selectedMenu();

      afterNextRender(() => {
        this.scrollToUp();
      }, { injector: this.injector });
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const menuKey = params.get('menu');
      const routePath = this.route.snapshot.routeConfig?.path;

      if (id && routePath === 'dashboard/lead/:id') {
        this.clearPendingLinks();
        this.deepLink.pendingLeadId.set(id);
        this.menuState.setActiveMenuByRoute('leads');
        return;
      }

      if (id && routePath === 'dashboard/projects/:id') {
        this.clearPendingLinks();
        this.deepLink.pendingProjectId.set(id);
        this.menuState.setActiveMenuByRoute('projects');
        return;
      }

      if (id && routePath === 'dashboard/task-management/:id') {
        this.clearPendingLinks();
        this.deepLink.pendingTaskId.set(id);
        this.menuState.setActiveMenuByRoute('task-management');
        return;
      }

      if (id && routePath === 'dashboard/teams/:id') {
        this.clearPendingLinks();
        this.deepLink.pendingConversationId.set(id);
        this.menuState.setActiveMenuByRoute('teams');
        return;
      }

      this.clearPendingLinks();

      if (menuKey) {
        this.menuState.setActiveMenuByRoute(menuKey);
      }
    });
  }

  private clearPendingLinks(): void {
    this.deepLink.pendingLeadId.set(null);
    this.deepLink.pendingProjectId.set(null);
    this.deepLink.pendingTaskId.set(null);
    this.deepLink.pendingConversationId.set(null);
  }

  scrollToUp(): void {
    this.workspaceWrapper?.nativeElement.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }
}
