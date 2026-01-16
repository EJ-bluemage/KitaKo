using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using KitaKo.Data;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtangsController : ControllerBase
    {
        private readonly IRepository<Utang> _repository;
        private readonly ApplicationDbContext _dbContext;

        public UtangsController(IRepository<Utang> repository, ApplicationDbContext dbContext)
        {
            _repository = repository;
            _dbContext = dbContext;
        }

        // GET: api/utangs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Utang>>> GetUtangs()
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var utangs = await _dbContext.Utangs.Where(u => u.UserId == userId).ToListAsync();
            return Ok(utangs);
        }

        // GET: api/utangs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Utang>> GetUtang(int id)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var utang = await _repository.GetByIdAsync(id);
            if (utang == null || utang.UserId != userId)
                return NotFound();

            return Ok(utang);
        }

        // POST: api/utangs
        [HttpPost]
        public async Task<ActionResult<Utang>> PostUtang(Utang utang)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            utang.UserId = userId;
            utang.CreatedDate = DateTime.UtcNow;
            // Ensure DueDate is UTC
            if (utang.DueDate.Kind == DateTimeKind.Unspecified)
                utang.DueDate = DateTime.SpecifyKind(utang.DueDate, DateTimeKind.Utc);
            var createdUtang = await _repository.AddAsync(utang);
            return CreatedAtAction(nameof(GetUtang), new { id = createdUtang.Id }, createdUtang);
        }

        // PUT: api/utangs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUtang(int id, Utang utang)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var existingUtang = await _repository.GetByIdAsync(id);
            if (existingUtang == null || existingUtang.UserId != userId)
                return NotFound();

            existingUtang.CustomerName = utang.CustomerName;
            existingUtang.Amount = utang.Amount;
            existingUtang.DueDate = utang.DueDate;

            await _repository.UpdateAsync(existingUtang);
            return NoContent();
        }

        // DELETE: api/utangs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUtang(int id)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var utang = await _repository.GetByIdAsync(id);
            if (utang == null || utang.UserId != userId)
                return NotFound();

            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
