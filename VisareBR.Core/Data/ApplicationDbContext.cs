using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Entities;

namespace VisareBR.Core.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<BlogPost> BlogPosts { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
    public DbSet<SiteSettings> Settings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Custom configurations if needed
        builder.Entity<BlogPost>()
            .HasOne(p => p.Author)
            .WithMany()
            .HasForeignKey(p => p.AuthorId);
            
        builder.Entity<Evaluation>()
            .Property(e => e.Rating)
            .IsRequired();
    }
}
