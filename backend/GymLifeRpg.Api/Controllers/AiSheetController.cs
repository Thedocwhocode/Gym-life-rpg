using System.Text;
using GymLifeRpg.Api.Authentication;
using GymLifeRpg.Api.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymLifeRpg.Api.Controllers;

/// <summary>
/// Optional AI reader: the app posts the text it extracted from a workout sheet PDF (text/plain) and
/// gets the transcribed plan back. The text only lives in memory for the request and is never logged.
/// </summary>
[ApiController]
[Authorize(AuthenticationSchemes = PurchaseTokenAuthenticationSchemeOptions.SchemeName)]
public class AiSheetController(
    ISheetReader sheetReader,
    RateLimitService rateLimitService,
    ILogger<AiSheetController> logger
) : ControllerBase
{
    /// <summary>The app's SHEET_MAX_CHARS (pdf-import.ts).</summary>
    public const int MaxChars = 100_000;

    [Route("ai/sheet")]
    [HttpPost]
    // UTF-8 takes up to 4 bytes a character.
    [RequestSizeLimit(MaxChars * 4)]
    public async Task<IActionResult> ReadSheet(CancellationToken cancellationToken)
    {
        if (!sheetReader.Enabled)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }
        if (
            Request.ContentType is null
            || !Request.ContentType.StartsWith("text/plain", StringComparison.OrdinalIgnoreCase)
        )
        {
            return StatusCode(StatusCodes.Status415UnsupportedMediaType);
        }
        using var body = new StreamReader(Request.Body, Encoding.UTF8);
        var text = await body.ReadToEndAsync(cancellationToken);
        if (text.Length > MaxChars)
        {
            return StatusCode(StatusCodes.Status413PayloadTooLarge);
        }
        if (string.IsNullOrWhiteSpace(text))
        {
            return UnprocessableEntity();
        }

        var appStore = this.GetAppStore();
        var proToken = this.GetProToken();
        if (appStore is null || proToken is null)
        {
            return Unauthorized();
        }
        var rateLimit = await rateLimitService.GetRateLimitAsync(appStore.Value, proToken);
        if (rateLimit.IsRateLimited)
        {
            Response.Headers.RetryAfter = rateLimit.RetryAfter.ToString("R");
            return StatusCode(StatusCodes.Status429TooManyRequests);
        }

        try
        {
            var plan = await sheetReader.ReadAsync(text, cancellationToken);
            return plan is null ? UnprocessableEntity() : Ok(plan);
        }
        catch (Exception e) when (!cancellationToken.IsCancellationRequested)
        {
            // Type only: the message may echo the sheet's content.
            logger.LogWarning("Sheet read failed: {ErrorType}", e.GetType().Name);
            return StatusCode(StatusCodes.Status502BadGateway);
        }
    }
}
