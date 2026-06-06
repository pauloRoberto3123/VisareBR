using Microsoft.AspNetCore.Identity;

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
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string MaritalStatus { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string PassportNumber { get; set; } = string.Empty; // Will be encrypted in DB
    public DateTime PassportIssueDate { get; set; }
    public DateTime PassportExpiryDate { get; set; }
    public string TripPurpose { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
