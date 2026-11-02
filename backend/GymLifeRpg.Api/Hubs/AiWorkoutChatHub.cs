using GymLifeRpg.Api.Authentication;
using GymLifeRpg.Api.Models;
using GymLifeRpg.Api.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GymLifeRpg.Api.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(AiChatResponse message);
}

[Authorize(AuthenticationSchemes = PurchaseTokenAuthenticationSchemeOptions.SchemeName)]
public class AiWorkoutChatHub(IGptChatWorkoutPlanner planner) : Hub<IChatClient>
{
    public async Task SendMessage(string message)
    {
        await planner.SendMessageAsync(
            Context.ConnectionId,
            message,
            Clients.Caller.ReceiveMessage
        );
    }

    public async Task Introduce(string locale)
    {
        await planner.Introduce(Context.ConnectionId, locale, Clients.Caller.ReceiveMessage);
    }

    public async Task RestartChat()
    {
        await planner.ClearConversationAsync(Context.ConnectionId);
    }

    public Task StopInProgress()
    {
        planner.StopInProgress(Context.ConnectionId);
        return Task.CompletedTask;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await planner.ClearConversationAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
