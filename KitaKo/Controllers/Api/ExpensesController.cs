using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using Microsoft.EntityFrameworkCore;
using KitaKo.Data;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ExpensesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expenses>>> GetExpenses()
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var expenses = await _dbContext.Expenses
                .Where(e => e.UserId == userId)
                .OrderBy(e => e.Paid)
                .ThenBy(e => e.DueDate)
                .ToListAsync();

            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Expenses>> GetExpense(int id)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var expense = await _dbContext.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense == null)
            {
                return NotFound();
            }

            return Ok(expense);
        }

        [HttpPost]
        public async Task<ActionResult<Expenses>> PostExpense(Expenses expense)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            expense.UserId = userId;
            expense.CreatedDate = DateTime.UtcNow;
            expense.DueDate = EnsureUtc(expense.DueDate);

            _dbContext.Expenses.Add(expense);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, Expenses expense)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var existingExpense = await _dbContext.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (existingExpense == null)
            {
                return NotFound();
            }

            existingExpense.Name = expense.Name;
            existingExpense.Amount = expense.Amount;
            existingExpense.DueDate = EnsureUtc(expense.DueDate);
            existingExpense.Priority = expense.Priority;
            existingExpense.Paid = expense.Paid;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var expense = await _dbContext.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense == null)
            {
                return NotFound();
            }

            _dbContext.Expenses.Remove(expense);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteExpenses()
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var expenses = await _dbContext.Expenses
                .Where(e => e.UserId == userId)
                .ToListAsync();

            _dbContext.Expenses.RemoveRange(expenses);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            return int.TryParse(userIdStr, out userId);
        }

        private static DateTime EnsureUtc(DateTime value)
        {
            return value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
                : value.ToUniversalTime();
        }
    }
}
