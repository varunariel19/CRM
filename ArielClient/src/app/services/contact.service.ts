import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, CreateContactPayload, UpdateContactPayload } from '../core/types/contact.type';
import { endpoints } from '../core/constants/endpoints';

@Injectable({
    providedIn: 'root'
})
export class ContactService {

    constructor(private http: HttpClient) { }

    getContact(id: string): Observable<Contact> {
        return this.http.get<Contact>(endpoints.getContactById(id));
    }

    getAllContacts(): Observable<Contact[]> {
        return this.http.get<Contact[]>(endpoints.getContacts);
    }

    createContact(payload: CreateContactPayload): Observable<Contact> {
        return this.http.post<Contact>(endpoints.createContact, payload, { withCredentials: true });
    }

    updateContact(id: string, payload: UpdateContactPayload): Observable<Contact> {
        return this.http.put<Contact>(endpoints.updateContact(id), payload , { withCredentials: true });
    }

    deleteContact(id: string): Observable<void> {
        return this.http.delete<void>(endpoints.deleteContact(id) , { withCredentials: true });
    }
}