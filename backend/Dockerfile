FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["NutriPulse.Api.csproj", "./"]
RUN dotnet restore "NutriPulse.Api.csproj"
COPY . .
RUN dotnet publish "NutriPulse.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "NutriPulse.Api.dll"]
