namespace KitaKo.Models
{
    public class Expenses
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Name { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public int Priority { get; set; }
        public bool Paid { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class ExpenseOptimizationResult
    {
        public List<Expenses>? RecommendedExpenses { get; set; }
        public decimal TotalOptimizedCost { get; set; }
        public decimal RemainingBudget { get; set; }
    }
}
