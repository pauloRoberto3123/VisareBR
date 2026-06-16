using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace VisareBR.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}

public class BlogPost
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public ApplicationUser? Author { get; set; }
}

public class Evaluation
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 to 5
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsApproved { get; set; } = false;
}

public class SiteSettings
{
    public int Id { get; set; }
    public string WhatsappNumber { get; set; } = string.Empty;
    public string WhatsappDefaultMessage { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
}

public class Ds160Submission
{
    public int Id { get; set; }
    public string ApplicantName { get; set; } = string.Empty; // Extracted for easy Admin viewing
    public string Email { get; set; } = string.Empty; // Extracted for easy Admin viewing
    public string PassportNumber { get; set; } = string.Empty; // Will be encrypted in DB
    public string JsonData { get; set; } = string.Empty; // The entire 8-step form payload stored as JSONB
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsReviewed { get; set; } = false;
}

public class Plan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ProcessingTime { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<PlanBenefit> Benefits { get; set; } = new List<PlanBenefit>();
    public ICollection<PlanPricingTier> PricingTiers { get; set; } = new List<PlanPricingTier>();
}

public class PlanBenefit
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsIncluded { get; set; } = true;
    [JsonIgnore]
    public Plan? Plan { get; set; }
}

public class PlanPricingTier
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public int ApplicantCount { get; set; }
    public decimal TotalPrice { get; set; }
    [JsonIgnore]
    public Plan? Plan { get; set; }
}

public class StandaloneService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
