using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Data.Repositories;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtangsController : ControllerBase
    {
        private readonly IRepository<Utang> _repository;

        public UtangsController(IRepository<Utang> repository)
        {
            _repository = repository;
        }

        // GET: api/utangs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Utang>>> GetUtangs()
        {
            var utangs = await _repository.GetAllAsync();
            return Ok(utangs);
        }

        // GET: api/utangs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Utang>> GetUtang(int id)
        {
            var utang = await _repository.GetByIdAsync(id);
            if (utang == null)
                return NotFound();

            return Ok(utang);
        }

        // POST: api/utangs
        [HttpPost]
        public async Task<ActionResult<Utang>> PostUtang(Utang utang)
        {
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
            var existingUtang = await _repository.GetByIdAsync(id);
            if (existingUtang == null)
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
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
