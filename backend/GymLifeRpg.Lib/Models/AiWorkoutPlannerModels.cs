using System.Collections.Immutable;

namespace GymLifeRpg.Lib.Models;

public enum AppStore
{
    Web,
    RevenueCat,
}

public record AiWorkoutPlan(
    string Name,
    string Description,
    ImmutableList<SessionBlueprint> Sessions
);
