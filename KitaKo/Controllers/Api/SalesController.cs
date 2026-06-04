using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using Microsoft.EntityFrameworkCore;
using KitaKo.Data;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public SalesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var sales = await _dbContext.Sales
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.Date)
                .ToListAsync();

            return Ok(sales);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> GetSale(int id)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var sale = await _dbContext.Sales
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (sale == null)
            {
                return NotFound();
            }

            return Ok(sale);
        }

        [HttpPost]
        public async Task<ActionResult<Sale>> PostSale(Sale sale)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            sale.UserId = userId;
            sale.Date = DateTime.UtcNow;

            _dbContext.Sales.Add(sale);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, sale);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSale(int id, Sale sale)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var existingSale = await _dbContext.Sales
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (existingSale == null)
            {
                return NotFound();
            }

            existingSale.Amount = sale.Amount;
            existingSale.Profit = sale.Profit;
            existingSale.Description = sale.Description;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var sale = await _dbContext.Sales
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (sale == null)
            {
                return NotFound();
            }

            _dbContext.Sales.Remove(sale);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            return int.TryParse(userIdStr, out userId);
        }
    }
}
