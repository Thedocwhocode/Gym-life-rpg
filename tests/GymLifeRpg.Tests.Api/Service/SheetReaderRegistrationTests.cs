using GymLifeRpg.Api.Service;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GymLifeRpg.Tests.Api.Service;

/// <summary>The AI reader is optional: no key means the API starts with the reader off.</summary>
public class SheetReaderRegistrationTests
{
    private static ISheetReader Resolve(Dictionary<string, string?> settings)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(
            new ConfigurationBuilder().AddInMemoryCollection(settings).Build()
        );
        services.AddSheetReader();
        return services.BuildServiceProvider().GetRequiredService<ISheetReader>();
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("  ")]
    public async Task WithoutAKey_TheReaderIsOff(string? key)
    {
        var reader = Resolve(new() { ["SheetReaderApiKey"] = key });

        await Assert.That(reader.Enabled).IsFalse();
        await Assert.That(reader).IsTypeOf<DisabledSheetReader>();
    }

    [Test]
    public async Task WithAKey_TheReaderIsOn()
    {
        var reader = Resolve(new() { ["SheetReaderApiKey"] = "gsk_test" });

        await Assert.That(reader.Enabled).IsTrue();
        await Assert.That(reader).IsTypeOf<GptSheetReader>();
    }
}
