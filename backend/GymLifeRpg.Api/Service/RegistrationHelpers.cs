namespace GymLifeRpg.Api.Service;

using System.ClientModel;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Kiota.Http.HttpClientLibrary;
using RevenueCat.Client;

public static class RegistrationHelpers
{
    public const string DefaultSheetReaderBaseUrl = "https://api.groq.com/openai/v1";

    // Groq lists it among the models with strict json_schema (constrained decoding).
    public const string DefaultSheetReaderModel = "openai/gpt-oss-120b";

    /// <summary>
    /// The optional AI sheet reader: any OpenAI-compatible chat API, Groq by default. Without
    /// SheetReaderApiKey the API still starts and POST /ai/sheet answers 503.
    /// </summary>
    public static IServiceCollection AddSheetReader(this IServiceCollection source)
    {
        source.AddSingleton<ISheetReader>(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var apiKey = configuration.GetValue<string?>("SheetReaderApiKey");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return new DisabledSheetReader();
            }
            var endpoint = new Uri(
                configuration.GetValue<string?>("SheetReaderBaseUrl") ?? DefaultSheetReaderBaseUrl
            );
            var model =
                configuration.GetValue<string?>("SheetReaderModel") ?? DefaultSheetReaderModel;
            var client = new OpenAI.Chat.ChatClient(
                model,
                new ApiKeyCredential(apiKey),
                new OpenAI.OpenAIClientOptions { Endpoint = endpoint }
            );
            return new GptSheetReader(client, disableStorage: endpoint.Host == "api.openai.com");
        });
        return source;
    }

    public static IServiceCollection AddRevenueCatPurchaseVerification(
        this IServiceCollection source
    )
    {
        source.AddSingleton<IRevenueCatPurchaseVerificationService>(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var accessTokenProvider = new AccessTokenProvider(
                configuration.GetValue<string>("RevenueCatApiKey")
                    ?? throw new Exception("RevenueCatApiKey not set")
            );
            var authProvider = new BaseBearerTokenAuthenticationProvider(accessTokenProvider);

            var adapter = new HttpClientRequestAdapter(authProvider);
            var revenueCatClient = new RevenueCatClient(adapter);
            var projectConfiguredRevenueCatApiClient = revenueCatClient.Projects[
                configuration.GetValue<string>("RevenueCatProjectId")
                    ?? throw new Exception("RevenueCatProjectId not set")
            ];
            var proEntitlementId =
                configuration.GetValue<string>("RevenueCatProEntitlementId")
                ?? throw new Exception("RevenueCatProEntitlementId not set");
            return new RevenueCatPurchaseVerificationService(
                projectConfiguredRevenueCatApiClient,
                proEntitlementId
            );
        });

        return source;
    }

    public static IServiceCollection AddWebAuthPurchaseVerification(this IServiceCollection source)
    {
        source.AddSingleton(
            (service) =>
            {
                var configuration = service.GetRequiredService<IConfiguration>();
                var webAuthKey = configuration.GetValue<string?>("WebAuthApiKey");
                return new WebAuthPurchaseVerificationService(webAuthKey);
            }
        );
        return source;
    }

    class AccessTokenProvider(string accessToken) : IAccessTokenProvider
    {
        public AllowedHostsValidator AllowedHostsValidator { get; } = new AllowedHostsValidator();

        public Task<string> GetAuthorizationTokenAsync(
            Uri uri,
            Dictionary<string, object>? additionalAuthenticationContext = null,
            CancellationToken cancellationToken = default
        )
        {
            return Task.FromResult(accessToken);
        }
    }
}
