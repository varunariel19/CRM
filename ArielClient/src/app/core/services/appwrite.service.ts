import { Injectable } from '@angular/core';
import { Client, Storage, ID } from 'appwrite';
import { appwrite } from '../constants/endpoints';

@Injectable({ providedIn: 'root' })
export class AppwriteService {
    private client = new Client();
    private storage: Storage;

    constructor() {
        this.client
            .setEndpoint(appwrite.appwriteEndpoint)
            .setProject(appwrite.appwriteProjectId);

        this.storage = new Storage(this.client);
    }

    async uploadFile(file: File): Promise<string> {
        const response = await this.storage.createFile(
            appwrite.appwriteBucketId,
            ID.unique(),
            file
        );
        const url = `${appwrite.appwriteEndpoint}/storage/buckets/${appwrite.appwriteBucketId}/files/${response.$id}/view?project=${appwrite.appwriteProjectId}`;
        return url;
    }

    async deleteFile(fileId: string): Promise<void> {
        await this.storage.deleteFile(appwrite.appwriteBucketId, fileId);
    }
}