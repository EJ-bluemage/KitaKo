namespace KitaKo.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public decimal Profit { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
    }
}