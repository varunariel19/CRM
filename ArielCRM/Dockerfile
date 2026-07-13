# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files first for layer caching
COPY ArielCRM.API/*.csproj ArielCRM.API/
COPY ArielCRM.Application/*.csproj ArielCRM.Application/
COPY ArielCRM.DataLayer/*.csproj ArielCRM.DataLayer/
COPY ArielCRM.Infrastructure/*.csproj ArielCRM.Infrastructure/
COPY ArielCRM.Shared/*.csproj ArielCRM.Shared/

RUN dotnet restore ArielCRM.API/ArielCRM.API.csproj

# Copy everything else and build
COPY . .
WORKDIR /src/ArielCRM.API
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ArielCRM.API.dll"]