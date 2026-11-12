using GymLifeRpg.Api.Authentication;
using GymLifeRpg.Api.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymLifeRpg.Api.Controllers;

/// <summary>
/// F10: the app posts the raw PDF of a workout sheet and gets the transcribed plan back.
/// The file only lives in memory for the request; its content is never logged.
/// </summary>
[ApiController]
[Authorize(AuthenticationSchemes = PurchaseTokenAuthenticationSchemeOptions.SchemeName)]
public class AiSheetController(
    ISheetReader sheetReader,
    RateLimitService rateLimitService,
    ILogger<AiSheetController> logger
) : ControllerBase
{
    public const int MaxBytes = 10 * 1024 * 1024;

    [Route("ai/sheet")]
    [HttpPost]
    [RequestSizeLimit(MaxBytes + 1)]
    public async Task<IActionResult> ReadSheet(CancellationToken cancellationToken)
    {
        using var buffer = new MemoryStream();
        await Request.Body.CopyToAsync(buffer, cancellationToken);
        if (buffer.Length > MaxBytes)
        {
            return StatusCode(StatusCodes.Status413PayloadTooLarge);
        }
        var bytes = buffer.ToArray();
        if (bytes.Length < 5 || !"%PDF-"u8.SequenceEqual(bytes.AsSpan(0, 5)))
        {
            return StatusCode(StatusCodes.Status415UnsupportedMediaType);
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
            var plan = await sheetReader.ReadAsync(new BinaryData(bytes), cancellationToken);
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
