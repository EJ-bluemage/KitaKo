using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using Microsoft.EntityFrameworkCore;
using KitaKo.Data;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtangsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public UtangsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Utang>>> GetUtangs()
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var utangs = await _dbContext.Utangs
                .Where(u => u.UserId == userId)
                .OrderBy(u => u.Paid)
                .ThenBy(u => u.DueDate)
                .ToListAsync();

            return Ok(utangs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Utang>> GetUtang(int id)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var utang = await _dbContext.Utangs
                .FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

            if (utang == null)
            {
                return NotFound();
            }

            return Ok(utang);
        }

        [HttpPost]
        public async Task<ActionResult<Utang>> PostUtang(Utang utang)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            utang.UserId = userId;
            utang.CreatedDate = DateTime.UtcNow;
            utang.DueDate = EnsureUtc(utang.DueDate);

            _dbContext.Utangs.Add(utang);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUtang), new { id = utang.Id }, utang);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUtang(int id, Utang utang)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var existingUtang = await _dbContext.Utangs
                .FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

            if (existingUtang == null)
            {
                return NotFound();
            }

            existingUtang.CustomerName = utang.CustomerName;
            existingUtang.Amount = utang.Amount;
            existingUtang.DueDate = EnsureUtc(utang.DueDate);
            existingUtang.Paid = utang.Paid;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUtang(int id)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var utang = await _dbContext.Utangs
                .FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

            if (utang == null)
            {
                return NotFound();
            }

            _dbContext.Utangs.Remove(utang);
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
