## DATABASE UPDATE :

dotnet ef migrations add UpdatedFolderTable --project ArielCRM.Infrastructure --startup-project ArielCRM.API
dotnet ef database update --project ArielCRM.Infrastructure --startup-project ArielCRM.API
dotnet ef migrations remove  --project ArielCRM.Infrastructure --startup-project ArielCRM.API



1. Directory and File Management operations, including implementing folder and file permissions.
2. Created multiple selection of files and folder for bulk operations.
3. Actions such as cut, copy, rename, move, delete, and other file management functionalities.
4. Recycle bin for restore and delete it completely with blob reference.
5. Can create folder and upload file for the backup . 
