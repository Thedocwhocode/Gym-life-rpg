using GymLifeRpg.Api.Models;

namespace GymLifeRpg.Api.Service;

public interface IGptChatWorkoutPlanner
{
    Task Introduce(string connectionId, string locale, Func<AiChatResponse, Task> callback);
    Task SendMessageAsync(
        string connectionId,
        string userMessage,
        Func<AiChatResponse, Task> callback
    );
    Task ClearConversationAsync(string connectionId);
    void StopInProgress(string connectionId);
}
