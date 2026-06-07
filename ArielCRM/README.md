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

levelId : 9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2,
designationId : 80B22952-1C67-42BF-824C-9050CDC7C586,
departmentId : BFCA932C-6DFD-49F9-9DDA-EFCC3472B45A,
email : amit@arielsoftwares.com,
password : amit@45,
adminKey : 4bb068cbd6115d58eedad84903784b005ee8eb8ffe651089713fdd639a12

}
