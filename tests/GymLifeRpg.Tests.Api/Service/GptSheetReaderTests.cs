using GymLifeRpg.Api.Service;

namespace GymLifeRpg.Tests.Api.Service;

/// <summary>F10: the real parse path, fed with output in the exact AiSheetPlan.json shape.</summary>
public class GptSheetReaderTests
{
    private const string ModelOutput = """
        {
          "Name": "Ficha hipertrofia",
          "Description": "",
          "Sessions": [
            {
              "Name": "Treino A",
              "Description": "Peito",
              "Exercises": [
                {
                  "Name": "Supino reto",
                  "Sets": 4,
                  "RepsPerSet": 8,
                  "WeightIncreaseOnSuccess": 0,
                  "Notes": "20 kg, 8-12 reps",
                  "RestBetweenSets": { "MinRestSeconds": 90, "MaxRestSeconds": 120, "FailureRestSeconds": 180 }
                },
                {
                  "Name": "Prancha",
                  "Sets": 0,
                  "RepsPerSet": 0,
                  "WeightIncreaseOnSuccess": 0,
                  "Notes": "",
                  "RestBetweenSets": { "MinRestSeconds": 90, "MaxRestSeconds": 120, "FailureRestSeconds": 180 }
                }
              ]
            }
          ]
        }
        """;

    [Test]
    public async Task Parse_ReadsEveryFieldOfTheSchema()
    {
        var plan = GptSheetReader.Parse(ModelOutput);

        await Assert.That(plan).IsNotNull();
        await Assert.That(plan!.Name).IsEqualTo("Ficha hipertrofia");
        var session = plan.Sessions.Single();
        await Assert.That(session.Name).IsEqualTo("Treino A");
        await Assert.That(session.Notes).IsEqualTo("Peito");
        var bench = session.Exercises[0];
        await Assert.That(bench.Name).IsEqualTo("Supino reto");
        await Assert.That(bench.Sets).IsEqualTo(4);
        await Assert.That(bench.RepsPerSet).IsEqualTo(8);
        await Assert.That(bench.Notes).IsEqualTo("20 kg, 8-12 reps");
        await Assert.That(bench.RestBetweenSets.MinRest).IsEqualTo(TimeSpan.FromSeconds(90));
        await Assert.That(bench.RestBetweenSets.FailureRest).IsEqualTo(TimeSpan.FromSeconds(180));
    }

    [Test]
    public async Task Parse_GivesMissingCountsAUsableMinimum()
    {
        var plank = GptSheetReader.Parse(ModelOutput)!.Sessions.Single().Exercises[1];

        await Assert.That(plank.Sets).IsEqualTo(1);
        await Assert.That(plank.RepsPerSet).IsEqualTo(1);
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("""{"Name":"x","Description":"","Sessions":[{"Name":"A","Description":"","Exercises":[]}]}""")]
    public async Task Parse_WithoutExercises_IsNull(string? json)
    {
        await Assert.That(GptSheetReader.Parse(json)).IsNull();
    }
}
