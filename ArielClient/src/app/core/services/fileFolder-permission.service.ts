import { inject, Injectable } from "@angular/core";
import { AuthState } from "../../state/auth.state";

export type DriveKey = 'A:' | 'B:' | 'C:' | 'D:';

@Injectable({ providedIn: 'root' })
export class FileAndFolderPermissionService {


    private authState = inject(AuthState);

    canAccessDrive(driveKey: DriveKey): boolean {
        const currentAccessLevel = this.authState.user()?.accessLevel.access;
        if (!currentAccessLevel) return false;
        switch (driveKey) {
            case 'A:': {
                const required = 10;
                return currentAccessLevel >= required;

            }
            case 'B:': {
                const required = 60;
                return currentAccessLevel == required   || currentAccessLevel == 100;
            }

            case 'C:': {
                const required = 80;
                return currentAccessLevel == required || currentAccessLevel == 100;
            }

            case 'D:': {
                const required = 10;
                return currentAccessLevel >= required;

            }
            default:
                return false;
        }
    }


}