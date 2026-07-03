import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';
import { AppNotification } from '../../state/notification.state';


@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly http = inject(HttpClient);


    getNotifications(take: number = 30): Observable<AppNotification[]> {
        return this.http.get<AppNotification[]>(`${endpoints.notification.allNotification}?take=${take}`, { withCredentials: true });
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
}