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
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Configure file serving options
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);
builder.Environment.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

// Ensure wwwroot/uploads directory exists
var uploadsPath = Path.Combine(builder.Environment.WebRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Add services to the container.
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
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
var mongoSettings = builder.Configuration.GetSection("MongoDb").Get<MongoDbSettings>() 
    ?? throw new InvalidOperationException("MongoDB settings not found in configuration");
var mongoClient = new MongoClient(mongoSettings.ConnectionString);
var database = mongoClient.GetDatabase(mongoSettings.DatabaseName);

// Ensure indexes exist
var articleCollection = database.GetCollection<Article>("articles");
var userCollection = database.GetCollection<User>("users");

// Create indexes if they don't exist
var articleIndexes = articleCollection.Indexes.List().ToList();
if (!articleIndexes.Any(i => i["name"] == "userId_1"))
{
    var indexKeysDefinition = Builders<Article>.IndexKeys.Ascending(a => a.UserId);
    articleCollection.Indexes.CreateOne(new CreateIndexModel<Article>(indexKeysDefinition));
}

var userIndexes = userCollection.Indexes.List().ToList();
// Ne créer que l'index email unique
if (!userIndexes.Any(i => i["name"] == "email_1"))
{
    var emailIndex = Builders<User>.IndexKeys.Ascending(u => u.Email);
    userCollection.Indexes.CreateOne(new CreateIndexModel<User>(emailIndex, new CreateIndexOptions { Unique = true }));
}

builder.Services.AddSingleton<IMongoClient>(mongoClient);
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.AddScoped<ArticleService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<FriendRequestService>();
builder.Services.AddSingleton<LoginAttemptTracker>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://192.168.43.100:5173") // Remplace par le port réel du frontend si différent
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
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

// Configure Kestrel for all network interfaces
app.Urls.Clear();
app.Urls.Add("http://192.168.43.100:5131"); // <-- Utilise l'IP locale

// Only use HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.Urls.Add("https://192.168.43.100:5132"); // <-- Utilise l'IP locale
}

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("AllowFrontend"); // <-- Utilise la nouvelle policy

// Important: Correct middleware order
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
    DefaultContentType = "application/octet-stream"
});

// Add minimal API health check endpoint
app.MapMethods("/api", new[] { "GET", "HEAD" }, () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();
