using System.Net;
using System.Text;
using GymLifeRpg.Api.Service;
using GymLifeRpg.Lib.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace GymLifeRpg.Tests.Api.Integration;

/// <summary>F10: POST /ai/sheet behind the pro purchase token (the sheet reader is mocked).</summary>
[ClassDataSource<Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>>(
    Shared = SharedType.PerClass
)]
public class AuthenticationIntegrationTests
{
    private readonly WebApplicationFactory<Program> _factory;
    private const string TestWebAuthKey = "test-web-auth-key-12345";
    private const string TestRevenueCatUserId = "test-user-with-pro";
    private const string EmptySheetMarker = "EMPTY-SHEET";

    private static readonly AiWorkoutPlan Plan = new(
        "Ficha hipertrofia",
        "",
        [
            new SessionBlueprint(
                "Treino A",
                [
                    new ExerciseBlueprint(
                        "Supino reto",
                        4,
                        10,
                        0,
                        new Rest(
                            TimeSpan.FromSeconds(90),
                            TimeSpan.FromSeconds(120),
                            TimeSpan.FromSeconds(180)
                        ),
                        false,
                        Notes: "20 kg",
                        Link: ""
                    ),
                ],
                Notes: ""
            ),
        ]
    );

    public AuthenticationIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = TestFactoryHelper.CreateTestFactory(
            factory,
            services =>
            {
                var sheetReader = Substitute.For<ISheetReader>();
                sheetReader
                    .ReadAsync(Arg.Any<BinaryData>(), Arg.Any<CancellationToken>())
                    .Returns(call =>
                        call.ArgAt<BinaryData>(0).ToString().Contains(EmptySheetMarker)
                            ? null
                            : Plan
                    );
                services.AddSingleton(sheetReader);

                var mockRevenueCatService =
                    Substitute.For<IRevenueCatPurchaseVerificationService>();
                mockRevenueCatService
                    .GetUserIdHasProEntitlementAsync(TestRevenueCatUserId)
                    .Returns(Task.FromResult(true));
                mockRevenueCatService
                    .GetUserIdHasProEntitlementAsync(Arg.Is<string>(x => x != TestRevenueCatUserId))
                    .Returns(Task.FromResult(false));
                services.AddSingleton(mockRevenueCatService);

                services.AddScoped(_ => new WebAuthPurchaseVerificationService(TestWebAuthKey));
            }
        );
    }

    private static ByteArrayContent Pdf(string body = "1.4 sheet") =>
        new(Encoding.ASCII.GetBytes("%PDF-" + body));

    private async Task<HttpResponseMessage> PostSheet(string? auth, HttpContent content)
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/ai/sheet") { Content = content };
        if (auth is not null)
        {
            request.Headers.TryAddWithoutValidation("Authorization", auth);
        }
        return await client.SendAsync(request);
    }

    [Test]
    public async Task Sheet_WithValidWebAuth_ReturnsThePlan()
    {
        var response = await PostSheet($"Web {TestWebAuthKey}", Pdf());

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        await Assert.That(body).Contains("Treino A");
        await Assert.That(body).Contains("20 kg");
        // The app's parseDuration reads this exact shape (TimeSpanJsonConverter).
        await Assert.That(body).Contains("\"minRest\":\"0.00:01:30:\"");
    }

    [Test]
    public async Task Sheet_WithBearerPrefix_ReturnsThePlan()
    {
        var response = await PostSheet($"Bearer RevenueCat {TestRevenueCatUserId}", Pdf());

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
    }

    [Test]
    [Arguments(null)]
    [Arguments("Web invalid-token")]
    [Arguments("RevenueCat invalid-user-id")]
    [Arguments("InvalidStore test-web-auth-key-12345")]
    [Arguments("MalformedHeader")]
    public async Task Sheet_WithoutValidAuth_IsUnauthorized(string? auth)
    {
        var response = await PostSheet(auth, Pdf());

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Sheet_ThatIsNotAPdf_IsRejected()
    {
        var response = await PostSheet(
            $"Web {TestWebAuthKey}",
            new ByteArrayContent(Encoding.ASCII.GetBytes("<html>not a pdf</html>"))
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.UnsupportedMediaType);
    }

    [Test]
    public async Task Sheet_OverTheLimit_IsRejected()
    {
        var bytes = new byte[AiSheetLimit + 1];
        "%PDF-"u8.CopyTo(bytes);

        var response = await PostSheet($"Web {TestWebAuthKey}", new ByteArrayContent(bytes));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.RequestEntityTooLarge);
    }

    [Test]
    public async Task Sheet_WithoutWorkouts_IsUnprocessable()
    {
        var response = await PostSheet($"Web {TestWebAuthKey}", Pdf(EmptySheetMarker));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.UnprocessableEntity);
    }

    private const int AiSheetLimit = GymLifeRpg.Api.Controllers.AiSheetController.MaxBytes;
}
