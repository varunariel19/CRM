import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface UpdateProfileResponse extends ApiResponse {
  name: string;
  profileImage?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private http = inject(HttpClient);
  private base = `${endpoints.user}`;

  updateProfile(name: string, profileImage?: File): Observable<UpdateProfileResponse> {
    const form = new FormData();
    form.append('name', name);
    if (profileImage) form.append('profileImage', profileImage);
    return this.http.put<UpdateProfileResponse>(`${this.base}/profile`, form , {withCredentials : true});
  }

  removeProfileImage(): Observable<UpdateProfileResponse> {
    return this.http.delete<UpdateProfileResponse>(`${this.base}/profile-image` , {withCredentials : true});
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    }, {withCredentials : true});
  }
}