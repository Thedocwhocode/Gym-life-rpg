using System.Text.Json;
using System.Text.Json.Serialization;

namespace GymLifeRpg.Lib.Serialization;

public static class JsonSerializerSettings
{
    public static JsonSerializerOptions GymLifeRpg =>
        new(JsonSerializerOptions.Default)
        {
            AllowTrailingCommas = true,
            PropertyNameCaseInsensitive = true,
            Converters =
            {
                new JsonStringEnumConverter(),
                new TimeSpanJsonConverter(),
                new ImmutableDictionaryJsonConverter(),
            },
        };
}
