using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Data.Repositories;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly IRepository<Expenses> _repository;

        public ExpensesController(IRepository<Expenses> repository)
        {
            _repository = repository;
        }

        // GET: api/expenses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expenses>>> GetExpenses()
        {
            var expenses = await _repository.GetAllAsync();
            return Ok(expenses);
        }

        // GET: api/expenses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Expenses>> GetExpense(int id)
        {
            var expense = await _repository.GetByIdAsync(id);
            if (expense == null)
                return NotFound();

            return Ok(expense);
        }

        // POST: api/expenses
        [HttpPost]
        public async Task<ActionResult<Expenses>> PostExpense(Expenses expense)
        {
            expense.CreatedDate = DateTime.UtcNow;
            var createdExpense = await _repository.AddAsync(expense);
            return CreatedAtAction(nameof(GetExpense), new { id = createdExpense.Id }, createdExpense);
        }

        // PUT: api/expenses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, Expenses expense)
        {
            var existingExpense = await _repository.GetByIdAsync(id);
            if (existingExpense == null)
                return NotFound();

            existingExpense.Name = expense.Name;
            existingExpense.Amount = expense.Amount;
            existingExpense.DueDate = expense.DueDate;
            existingExpense.Priority = expense.Priority;
            existingExpense.Paid = expense.Paid;

            await _repository.UpdateAsync(existingExpense);
            return NoContent();
        }

        // DELETE: api/expenses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
