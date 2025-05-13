using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using TTH.Backend.Data;
using TTH.Backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MongoDB.Driver;
using TTH.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add this before other service configurations
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);
builder.Environment.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TTH API", Version = "v1" });
});

// Configure MongoDB
var mongoSettings = builder.Configuration.GetSection("MongoDb").Get<MongoDbSettings>();
var mongoClient = new MongoClient(new MongoClientSettings
{
    Server = new MongoServerAddress("localhost", 27017),
    Credential = MongoCredential.CreateCredential("admin", "root", "example"),
    ServerSelectionTimeout = TimeSpan.FromSeconds(5),
    ConnectTimeout = TimeSpan.FromSeconds(5),
    MaxConnectionPoolSize = 100,
    RetryWrites = true
});
builder.Services.AddSingleton<IMongoClient>(mongoClient);
builder.Services.AddScoped<ArticleService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<FriendRequestService>();
builder.Services.AddSingleton<LoginAttemptTracker>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", corsBuilder =>
    {
        // En développement et production, autoriser les origines spécifiques
        corsBuilder
            .WithOrigins(
                "http://localhost:5173",
                "http://192.168.43.223:5173",
                "http://192.168.43.223:5131",
                "http://localhost:5131"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Token-Expired", "Authorization");
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"] ?? 
                    throw new InvalidOperationException("Token secret is not configured"))),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Append("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

// Build the application
var app = builder.Build();

// Initialize MongoDB indexes
using (var scope = app.Services.CreateScope())
{
    var userService = scope.ServiceProvider.GetRequiredService<UserService>();
    await userService.InitializeIndexesAsync();
}

// Ensure wwwroot/uploads directory exists
var uploadsPath = Path.Combine(app.Environment.WebRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Configure Kestrel for all network interfaces
app.Urls.Clear();
app.Urls.Add("http://0.0.0.0:5131");

// Only use HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.Urls.Add("https://0.0.0.0:5132");
}

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Important: Correct middleware order
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
    DefaultContentType = "application/octet-stream"
});

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Add minimal API health check endpoint
app.MapMethods("/api", new[] { "GET", "HEAD" }, () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();
