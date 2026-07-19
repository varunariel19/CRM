## DATABASE UPDATE :

dotnet ef migrations add UpdatedFolderTable --project ArielCRM.Infrastructure --startup-project ArielCRM.API
dotnet ef database update --project ArielCRM.Infrastructure --startup-project ArielCRM.API
dotnet ef migrations remove  --project ArielCRM.Infrastructure --startup-project ArielCRM.API