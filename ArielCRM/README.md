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

levelId : 664430DB-9D17-4199-BEFE-4D6BE134FCB3,
designationId : 3231E743-3F38-47E4-8DD3-83CF46D837B2,
departmentId : 215BCD48-5EF1-4EEA-B37C-2AEB7A34F70C,
email : varun@gmail.com,
password : joshi@45,
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
