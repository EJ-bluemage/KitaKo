using KitaKo.Data;
using KitaKo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KitaKo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public SettingsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("financial")]
        public async Task<ActionResult<UserFinancialSettings>> GetFinancialSettings()
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var settings = await GetOrCreateSettings(userId);
            return Ok(settings);
        }

        [HttpPut("financial")]
        public async Task<ActionResult<UserFinancialSettings>> UpdateFinancialSettings(UserFinancialSettings request)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            if (request.AvailableBudget < 0 || request.DailySalesGoal <= 0)
            {
                return BadRequest("Budget must be zero or greater and daily goal must be greater than zero.");
            }

            var settings = await GetOrCreateSettings(userId);
            settings.AvailableBudget = request.AvailableBudget;
            settings.DailySalesGoal = request.DailySalesGoal;
            settings.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return Ok(settings);
        }

        private async Task<UserFinancialSettings> GetOrCreateSettings(int userId)
        {
            var settings = await _dbContext.UserFinancialSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings != null)
            {
                return settings;
            }

            settings = new UserFinancialSettings
            {
                UserId = userId,
                AvailableBudget = 0,
                DailySalesGoal = 1000,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.UserFinancialSettings.Add(settings);
            await _dbContext.SaveChangesAsync();
            return settings;
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            return int.TryParse(userIdStr, out userId);
        }
    }
}
