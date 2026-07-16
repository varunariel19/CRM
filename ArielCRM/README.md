## DATABASE UPDATE :

dotnet ef migrations add AddPermissionTable --project ArielCRM.Infrastructure --startup-project ArielCRM.API
dotnet ef database update --project ArielCRM.Infrastructure --startup-project ArielCRM.API
