## SQL SERVER STRING : 

 "ConnectionStrings": {
    "DefaultConnection": "Server=DESKTOP-SFLL6SP\\SQLEXPRESS;Database=ArielCRM;User Id=sa;Password=test12;Encrypt=False;"
  },

  "DbSettings": {
    "Server": "DESKTOP-SFLL6SP\\SQLEXPRESS",
    "UserId": "sa",
    "Password": "test12"
  },


## DOCKER CONTAINER STRING : 


"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=ArielCRM;User Id=sa;Password=Test@12345;Encrypt=False;"
},


"DbSettings": {
  "Server": "localhost,1433",
  "UserId": "sa",
  "Password": "Test@12345"
},



## DATABASE UPDATE :

dotnet ef migrations add AddPermissionTable --project ArielCRM.Infrastructure --startup-project ArielCRM.API
dotnet ef database update --project ArielCRM.Infrastructure --startup-project ArielCRM.API


admin account seed !!  
{

levelId : 740569C1-0D28-461B-AE28-98B4A88BBF31,
designationId : EEB7E63A-B672-4486-8FDC-5FF14D77E2DB,
departmentId : 208CC35C-C673-417D-9BDC-A4A503D25A8C,
email : amit@arielsoftwares.com,
password : amit@45,
adminKey : 4bb068cbd6115d58eedad84903784b005ee8eb8ffe651089713fdd639a12

}



## How to do the integration with keka 

1. Need all these details : 

https://{company}.{environment}.com/api/v1/hris/employees

var tokenRequest = new
{
    client_id = "your-client-id",
    client_secret = "your-client-secret",
    api_key = "your-api-key",
    grant_type = "kekaapi",
    scope = "kekaapi"
};




endpoints : 
1. To sync all members => get all details from keka => 
and register all member in CRM platform ! 
2. 
