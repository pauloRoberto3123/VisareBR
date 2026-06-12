using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Text.Json.Nodes;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Ds160Controller : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public Ds160Controller(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // Public: Submit a new DS-160 Form
    [HttpPost]
    public async Task<IActionResult> SubmitForm([FromBody] JsonElement data)
    {
        if (data.ValueKind == JsonValueKind.Undefined || data.ValueKind == JsonValueKind.Null) 
            return BadRequest("Data is required.");

        // Parse JSON to allow modifications before saving
        var jsonNode = JsonNode.Parse(data.GetRawText());
        var jsonObject = jsonNode as JsonObject;
        
        var step3 = jsonObject?["step3"] as JsonObject;
        if (step3 != null && step3.ContainsKey("passportPhotoBase64"))
        {
            var photoData = step3["passportPhotoBase64"]?.ToString();
            if (!string.IsNullOrEmpty(photoData) && photoData.StartsWith("data:image"))
            {
                var bucketName = _configuration["CloudStorage:BucketName"];
                if (!string.IsNullOrEmpty(bucketName))
                {
                    // Cloud storage configured! Process upload and replace Base64 with Cloud URL
                    var photoUrl = await UploadToBucketAsync(photoData, bucketName);
                    step3["passportPhotoBase64"] = photoUrl;
                }
            }
        }

        // We extract a few key properties to store in standard columns for easy sorting/listing in the Admin Dashboard.
        // The raw JSON is safely dumped into PostgreSQL's native JSONB column.
        var submission = new Ds160Submission
        {
            ApplicantName = jsonObject?["step1"]?["fullName"]?.ToString() ?? "Desconhecido",
            Email = jsonObject?["step2"]?["primaryEmail"]?.ToString() ?? "Sem Email",
            PassportNumber = jsonObject?["step3"]?["passportNumber"]?.ToString() ?? "",
            JsonData = jsonObject?.ToJsonString() ?? data.GetRawText(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Ds160Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Formulário recebido e criptografado com segurança." });
    }

    private async Task<string> UploadToBucketAsync(string base64Image, string bucketName)
    {
        var base64Data = base64Image.Contains(",") ? base64Image.Split(',')[1] : base64Image;
        byte[] imageBytes = Convert.FromBase64String(base64Data);
        var fileName = $"passport_{Guid.NewGuid():N}.jpg";

        var provider = _configuration["CloudStorage:Provider"] ?? "AWS"; // Use "AWS" or "Azure"

        if (provider == "AWS")
        {
            // PARA USAR AWS S3:
            // 1. Instale o pacote Nuget: AWSSDK.S3
            // 2. Descomente o código abaixo.
            
            /*
            var accessKey = _configuration["CloudStorage:AccessKey"];
            var secretKey = _configuration["CloudStorage:SecretKey"];
            var region = Amazon.RegionEndpoint.GetBySystemName(_configuration["CloudStorage:Region"] ?? "us-east-1");
            
            using var client = new Amazon.S3.AmazonS3Client(accessKey, secretKey, region);
            using var ms = new MemoryStream(imageBytes);
            var putRequest = new Amazon.S3.Model.PutObjectRequest
            {
                BucketName = bucketName,
                Key = fileName,
                InputStream = ms,
                ContentType = "image/jpeg",
                CannedACL = Amazon.S3.S3CannedACL.PublicRead
            };
            
            await client.PutObjectAsync(putRequest);
            return $"https://{bucketName}.s3.amazonaws.com/{fileName}";
            */
        }
        else if (provider == "Azure")
        {
            // PARA USAR AZURE BLOB STORAGE:
            // 1. Instale o pacote Nuget: Azure.Storage.Blobs
            // 2. Descomente o código abaixo.
            
            /*
            var connectionString = _configuration["CloudStorage:ConnectionString"];
            var blobServiceClient = new Azure.Storage.Blobs.BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(bucketName);
            await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            using var ms = new MemoryStream(imageBytes);
            await blobClient.UploadAsync(ms, new Azure.Storage.Blobs.Models.BlobHttpHeaders { ContentType = "image/jpeg" });
            
            return blobClient.Uri.ToString();
            */
        }

        // Fallback imediato: Se a cloud estiver configurada no appsettings.json, mas os pacotes ainda
        // não foram instalados/descomentados acima, retorna a string Base64 original para não perder a foto.
        return base64Image;
    }

    // Admin only: Get all received forms
    [Authorize]
    [HttpGet("admin")]
    public async Task<ActionResult<IEnumerable<Ds160Submission>>> GetAllSubmissions()
    {
        // The PassportNumber will be automatically decrypted when read from the database.
        var submissions = await _context.Ds160Submissions
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
            
        return Ok(submissions);
    }
}