# Build Stage for React Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /src
COPY VisareBR.Web/package*.json ./VisareBR.Web/
RUN cd VisareBR.Web && npm install
COPY VisareBR.Web/ ./VisareBR.Web/
RUN cd VisareBR.Web && npm run build

# Build Stage for .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-backend
WORKDIR /src
COPY ["VisareBR.Api/VisareBR.Api.csproj", "VisareBR.Api/"]
COPY ["VisareBR.Core/VisareBR.Core.csproj", "VisareBR.Core/"]
RUN dotnet restore "VisareBR.Api/VisareBR.Api.csproj"
COPY . .
RUN dotnet publish "VisareBR.Api/VisareBR.Api.csproj" -c Release -o /app/publish

# Final Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Disable configuration reload on change to prevent inotify instance limit errors on Render
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false
ENV DOTNET_SYSTEM_IO_DISABLEFILEWATCHING=true
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Copy Backend Build
COPY --from=build-backend /app/publish .

# Copy Frontend Build into the wwwroot of the API
# This allows the .NET API to serve the React files
COPY --from=build-frontend /src/VisareBR.Web/dist ./wwwroot

ENTRYPOINT ["dotnet", "VisareBR.Api.dll"]
