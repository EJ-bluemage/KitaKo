namespace KitaKo.Models
{
    public class Utang
    {
        public int Id { get; set; }
        public string? CustomerName { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
