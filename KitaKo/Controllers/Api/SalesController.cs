using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Data.Repositories;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly IRepository<Sale> _repository;

        public SalesController(IRepository<Sale> repository)
        {
            _repository = repository;
        }

        // GET: api/sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
        {
            var sales = await _repository.GetAllAsync();
            return Ok(sales);
        }

        // GET: api/sales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> GetSale(int id)
        {
            var sale = await _repository.GetByIdAsync(id);
            if (sale == null)
                return NotFound();

            return Ok(sale);
        }

        // POST: api/sales
        [HttpPost]
        public async Task<ActionResult<Sale>> PostSale(Sale sale)
        {
            sale.Date = DateTime.UtcNow;
            var createdSale = await _repository.AddAsync(sale);
            return CreatedAtAction(nameof(GetSale), new { id = createdSale.Id }, createdSale);
        }

        // PUT: api/sales/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSale(int id, Sale sale)
        {
            var existingSale = await _repository.GetByIdAsync(id);
            if (existingSale == null)
                return NotFound();

            existingSale.Amount = sale.Amount;
            existingSale.Profit = sale.Profit;
            existingSale.Description = sale.Description;

            await _repository.UpdateAsync(existingSale);
            return NoContent();
        }

        // DELETE: api/sales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
