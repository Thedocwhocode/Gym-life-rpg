using System.Text.Json.Serialization;
using FluentValidation;
using GymLifeRpg.Api.Authentication;
using GymLifeRpg.Api.Db;
using GymLifeRpg.Api.Service;
using GymLifeRpg.Api.Validators;
using GymLifeRpg.Lib.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>(
    ServiceLifetime.Singleton
);

// Add services to the container.

builder.Services.AddDbContext<UserDataContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("UserDataContext"))
        .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>()
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddDbContext<RateLimitContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("RateLimitContext"))
        .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>()
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod();
    });
});

// Add Authentication
builder
    .Services.AddAuthentication(PurchaseTokenAuthenticationSchemeOptions.SchemeName)
    .AddScheme<PurchaseTokenAuthenticationSchemeOptions, PurchaseTokenAuthenticationHandler>(
        PurchaseTokenAuthenticationSchemeOptions.SchemeName,
        options => { }
    );

builder.Services.AddAuthorization();

builder.Services.AddSingleton<PasswordService>();
builder.Services.AddScoped<RateLimitService>();

builder.Services.AddHostedService<CleanupExpiredDataHostedService>();

builder.Services.AddScoped<PurchaseVerificationService>();
builder.Services.AddGptSheetReader();
builder.Services.AddWebAuthPurchaseVerification();
builder.Services.AddRevenueCatPurchaseVerification();

builder
    .Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.AllowTrailingCommas = true;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.Converters.Add(new TimeSpanJsonConverter());
        opts.JsonSerializerOptions.Converters.Add(new ImmutableDictionaryJsonConverter());
    });

var app = builder.Build();
app.UseCors();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapMethods(
    "/health",
    ["GET", "HEAD"],
    () =>
    {
        return "healthy";
    }
);

if (!app.Configuration.GetValue<bool>("SkipDatabaseMigrations"))
{
    using var scope = app.Services.CreateScope();
    var userDb = scope.ServiceProvider.GetRequiredService<UserDataContext>();
    await userDb.Database.MigrateAsync();
    var rateLimitDb = scope.ServiceProvider.GetRequiredService<RateLimitContext>();
    await rateLimitDb.Database.MigrateAsync();
}

app.Run();
