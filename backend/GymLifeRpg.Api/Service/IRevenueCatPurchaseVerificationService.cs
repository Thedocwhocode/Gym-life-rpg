namespace GymLifeRpg.Api.Service;

public interface IRevenueCatPurchaseVerificationService
{
    Task<bool> GetUserIdHasProEntitlementAsync(string userId);
}
