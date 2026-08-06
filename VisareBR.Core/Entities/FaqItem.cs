namespace VisareBR.Core.Entities;

public class FaqItem
{
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string Category { get; set; } = "Geral";
}
