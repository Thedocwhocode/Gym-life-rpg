## GymLife RPG Backend

The GymLife RPG backend is written in C# on the latest .NET. The backend is responsible for storing and serving user feeds (which are end-to-end encrypted) and serving the AI planner. It requires a PostgreSQL database.

### Prerequisites

#### Installing .NET SDK

Install the latest .NET SDK for your platform:

**macOS:**

```bash
brew install dotnet
```

**Windows:**
Download and install from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)

**Linux (Ubuntu/Debian):**

```bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh --channel 10.0
```

For other Linux distributions, see the [official installation guide](https://learn.microsoft.com/en-us/dotnet/core/install/linux).

#### PostgreSQL Database

Optionally, to run a local PostgreSQL instance, use the provided Docker Compose file (requires Docker installed).

### Configuration

Before running the backend, you need to create a configuration file at [GymLifeRpg.Api/appsettings.Development.json](GymLifeRpg.Api/appsettings.Development.json).

Here is an example configuration that works with the Docker Compose setup:

```json
{
  "ConnectionStrings": {
    "UserDataContext": "Host=localhost;Port=5400;Database=gymliferpg;Username=postgres;Password=password",
    "RateLimitContext": "Host=localhost;Port=5400;Database=gymliferpg;Username=postgres;Password=password"
  },
  "WebAuthApiKey": "test-web-auth-key-12345",

  // Optional
  "RevenueCatApiKey": "test-key",
  "RevenueCatProjectId": "test-project",
  "RevenueCatProEntitlementId": "pro"
}
```

**Note:** The `RevenueCatApiKey` can be omitted if a `WebAuthApiKey` is provided. It is used only for validating in-app purchases for the AI planner.

#### Optional AI sheet reader

The app reads workout sheets on the device, with no AI. `POST /ai/sheet` is an optional fallback
that sends the sheet's text to an OpenAI-compatible chat API. Without `SheetReaderApiKey` the API
still starts and the endpoint answers 503.

| Key | Default |
|---|---|
| `SheetReaderApiKey` | none (reader off). A Groq key from console.groq.com |
| `SheetReaderBaseUrl` | `https://api.groq.com/openai/v1` |
| `SheetReaderModel` | `openai/gpt-oss-120b` (needs strict `json_schema` support) |

In production set them as environment variables (`SheetReaderApiKey=...`), never in a committed file.

### Running the Backend

Start the PostgreSQL database and run the backend:

```bash
cd ./backend/GymLifeRpg.Api
docker compose up -d
dotnet run
```

The backend should now be running at `http://localhost:5264`!

### Connecting the Development App

When running the app in development mode (as specified in the [root README](../README.md)), it will automatically connect to your local backend instance.
