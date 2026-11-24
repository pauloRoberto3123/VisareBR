using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
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

        var applicantName = jsonObject?["step1"]?["fullName"]?.ToString()?.Trim() ?? "Desconhecido";
        var applicantCpf = jsonObject?["step1"]?["cpf"]?.ToString()?.Trim() ?? "";
        var serverNowUtc = DateTime.UtcNow;

        // Compute SHA-256 hash of the submitted answers before injecting server audit metadata
        var step8 = jsonObject?["step8"] as JsonObject ?? new JsonObject();
        if (jsonObject != null && !jsonObject.ContainsKey("step8"))
        {
            jsonObject["step8"] = step8;
        }

        // Remove any client-supplied audit keys before computing canonical answers hash
        step8.Remove("termo_aceito_em");
        step8.Remove("termo_ip");
        step8.Remove("termo_user_agent");
        step8.Remove("respostas_hash");

        string canonicalAnswersJson = jsonObject?.ToJsonString() ?? data.GetRawText();
        byte[] hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(canonicalAnswersJson));
        string respostasHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

        string clientIp = GetClientIpAddress();
        string userAgent = Request.Headers.UserAgent.ToString();
        string termoTexto = BuildTermoV11Text(applicantName, applicantCpf);

        step8["termo_versao"] = "1.1";
        step8["termo_texto"] = termoTexto;
        step8["termo_aceito_em"] = serverNowUtc.ToString("yyyy-MM-ddTHH:mm:ssZ");
        step8["termo_ip"] = clientIp;
        step8["termo_user_agent"] = userAgent;
        step8["respostas_hash"] = respostasHash;

        // We extract a few key properties to store in standard columns for easy sorting/listing in the Admin Dashboard.
        // The raw JSON is safely dumped into PostgreSQL's native JSONB column.
        var submission = new Ds160Submission
        {
            ApplicantName = applicantName,
            Email = jsonObject?["step2"]?["primaryEmail"]?.ToString() ?? "Sem Email",
            PassportNumber = jsonObject?["step3"]?["passportNumber"]?.ToString() ?? "",
            JsonData = jsonObject?.ToJsonString() ?? data.GetRawText(),
            CreatedAt = serverNowUtc
        };

        _context.Ds160Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Formulário recebido e criptografado com segurança." });
    }

    private string GetClientIpAddress()
    {
        var cfIp = Request.Headers["CF-Connecting-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(cfIp))
            return cfIp.Trim();

        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',')[0].Trim();
            if (!string.IsNullOrWhiteSpace(firstIp))
                return firstIp;
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Não identificado";
    }

    private static string BuildTermoV11Text(string fullName, string cpf)
    {
        string nomeVal = string.IsNullOrWhiteSpace(fullName) ? "{nome completo}" : fullName.Trim();
        string cpfVal = string.IsNullOrWhiteSpace(cpf) ? "{CPF}" : cpf.Trim();

        return
            "Termo de revisão, veracidade e autorização de preparo — DS-160\n\n" +
            $"Eu, {nomeVal}, CPF {cpfVal}, declaro que:\n" +
            "1. Forneci pessoalmente todas as informações deste formulário e elas são verdadeiras, completas e corretas.\n" +
            "2. Li e entendi todas as perguntas, inclusive as perguntas de segurança, e respondi com sinceridade.\n" +
            "3. Sei que a DS-160 é um formulário oficial do Departamento de Estado dos EUA e que informações falsas ou enganosas podem levar à recusa permanente do visto ou à proibição de entrada nos Estados Unidos.\n" +
            "4. Autorizo a VisareBR a usar estas informações para preparar, digitar e enviar a minha DS-160 no site oficial (CEAC), traduzindo-as para o inglês quando necessário, e a constar como preparadora do formulário.\n" +
            "5. Antes do envio, vou receber o PDF da minha DS-160, revisar todas as respostas, inclusive as perguntas de segurança, e avisar a VisareBR sobre qualquer erro.\n" +
            "6. Depois de revisar o PDF, autorizo a VisareBR a enviar o meu formulário DS-160, sabendo que o envio certifica perante o governo americano que li e entendi as perguntas e que as respostas são verdadeiras.\n" +
            "7. Sei que a responsabilidade pelo conteúdo das respostas é exclusivamente minha e que a VisareBR não garante a emissão do visto, que é decisão exclusiva do oficial consular.\n" +
            "8. Autorizo a VisareBR a tratar os meus dados pessoais, inclusive os dados de saúde informados nas perguntas de segurança, somente para preparar o meu processo de visto, conforme a Lei 13.709/2018 (LGPD) e a Política de Privacidade da VisareBR. Posso pedir acesso, correção ou exclusão dos meus dados a qualquer momento.\n\n" +
            "[x] Li, revisei e autorizo a VisareBR a enviar o meu formulário DS-160.";
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

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubmission(int id, [FromBody] Ds160Submission updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");

        var submission = await _context.Ds160Submissions.FindAsync(id);
        if (submission == null) return NotFound("Submission not found");

        submission.JsonData = updated.JsonData;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}