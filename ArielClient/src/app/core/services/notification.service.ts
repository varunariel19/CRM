import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';
import { AppNotification, CreateNotificationDto } from '../../state/notification.state';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  getNotifications(take: number = 30): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${endpoints.notification.allNotification}?take=${take}`,
      { withCredentials: true }
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(endpoints.notification.unreadCount, { withCredentials: true });
  }


  createNotification(payload: AppNotification  , userId : string) {
    const createdPayload: CreateNotificationDto = {
      userIds: [userId],
      title: payload.title,
      message: payload.message,
      entityId: payload.entityId!,    
      link: payload.link,
      entityType: payload.entityType!
    }
    return this.http.post<any>(endpoints.notification.createNotification, createdPayload, { withCredentials: true });
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(
      endpoints.notification.singleRead(notificationId),
      {}, { withCredentials: true }
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(
      endpoints.notification.allRead,
      {}, { withCredentials: true }
    );
  }

  remove(notificationId: string): Observable<void> {
    return this.http.delete<void>(
      endpoints.notification.remove(notificationId),
      { withCredentials: true }
    );
  }

  clearRead(): Observable<void> {
    return this.http.delete<void>(
      endpoints.notification.clearRead,
      { withCredentials: true }
    );
  }
}