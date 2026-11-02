using System.Security.Claims;
using System.Text.Json;
using GymLifeRpg.Lib.Models;
using GymLifeRpg.Lib.Serialization;
using Microsoft.AspNetCore.Mvc;

namespace GymLifeRpg.Api.Authentication;

public static class ControllerExtensions
{
    public static string? GetProToken(this ControllerBase controller)
    {
        return controller.User?.FindFirst("ProToken")?.Value;
    }

    public static AppStore? GetAppStore(this ControllerBase controller)
    {
        var appStoreValue = controller.User?.FindFirst("AppStore")?.Value;
        if (string.IsNullOrEmpty(appStoreValue))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AppStore>(
                $"\"{appStoreValue}\"",
                JsonSerializerSettings.GymLifeRpg
            );
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public static string? GetUserId(this ControllerBase controller)
    {
        return controller.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
