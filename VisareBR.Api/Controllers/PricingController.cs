using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PricingController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Plan>>> GetPlans()
    {
        var plans = await _context.Plans
            .Include(p => p.Benefits)
            .Include(p => p.PricingTiers)
            .Where(p => p.IsActive)
            .ToListAsync();

        // Ordem do menor preço no tier base, para listar do mais barato (Padrão) ao VIP
        var sortedPlans = plans.OrderBy(p => p.PricingTiers.Any() ? p.PricingTiers.Min(t => t.TotalPrice) : 0).ToList();

        return Ok(sortedPlans);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePlanPricing(int id, [FromBody] Plan updatedPlan)
    {
        if (id != updatedPlan.Id) return BadRequest("ID do plano não coincide.");

        var plan = await _context.Plans
            .Include(p => p.PricingTiers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (plan == null) return NotFound("Plano não encontrado.");

        plan.Name = updatedPlan.Name;
        plan.ProcessingTime = updatedPlan.ProcessingTime;

        // Remove tiers que foram apagados no frontend
        var incomingTierCounts = updatedPlan.PricingTiers.Select(t => t.ApplicantCount).ToList();
        var tiersToRemove = plan.PricingTiers.Where(t => !incomingTierCounts.Contains(t.ApplicantCount)).ToList();
        _context.PlanPricingTiers.RemoveRange(tiersToRemove);

        // Adiciona ou atualiza os Tiers
        foreach (var tier in updatedPlan.PricingTiers)
        {
            var existingTier = plan.PricingTiers.FirstOrDefault(t => t.ApplicantCount == tier.ApplicantCount);
            if (existingTier != null) {
                existingTier.TotalPrice = tier.TotalPrice;
            } else {
                plan.PricingTiers.Add(new PlanPricingTier { ApplicantCount = tier.ApplicantCount, TotalPrice = tier.TotalPrice });
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}