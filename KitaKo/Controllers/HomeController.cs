using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Services;
using System.Collections.Generic;

namespace KitaKo.Controllers
{
    public class HomeController : Controller
    {
        private readonly KnapsackService _knapsackService;

        public HomeController()
        {
            _knapsackService = new KnapsackService();
        }

        // Landing Page
        public IActionResult Index()
        {
            return View();
        }

        // Dashboard
        public IActionResult Dashboard()
        {
            return View();
        }

        // Sales & Budget Page
        public IActionResult SalesTracker()
        {
            return View();
        }

        // Utang Logs Page
        public IActionResult UtangLogs()
        {
            return View();
        }

        // Expenses Page
        public IActionResult Expenses()
        {
            return View();
        }

        // API endpoint to save sale (you can expand this later with database)
        [HttpPost]
        public JsonResult AddSale([FromBody] Sale sale)
        {
            // TODO: Save to database
            return Json(new { success = true, sale });
        }

        // API endpoint to save utang
        [HttpPost]
        public JsonResult AddUtang([FromBody] Utang utang)
        {
            // TODO: Save to database
            return Json(new { success = true, utang });
        }

        // API endpoint to mark utang as paid
        [HttpPost]
        public JsonResult MarkUtangPaid(int id)
        {
            // TODO: Update in database
            return Json(new { success = true });
        }

        // API endpoint to add expense
        [HttpPost]
        public JsonResult AddExpense([FromBody] Expenses expense)
        {
            // TODO: Save to database
            return Json(new { success = true, expense });
        }

        // API endpoint to optimize expenses using Knapsack Algorithm
        [HttpPost]
        public JsonResult OptimizeExpenses([FromBody] OptimizationRequest request)
        {
            var result = _knapsackService.OptimizeExpenses(request.Expenses, request.Budget);
            return Json(new { success = true, result });
        }

        // API endpoint to mark expense as paid
        [HttpPost]
        public JsonResult MarkExpensePaid(int id)
        {
            // TODO: Update in database
            return Json(new { success = true });
        }

        // API endpoint to delete expense
        [HttpPost]
        public JsonResult DeleteExpense(int id)
        {
            // TODO: Delete from database
            return Json(new { success = true });
        }
    }

    // Request model for optimization
    public class OptimizationRequest
    {
        public List<Expenses> Expenses { get; set; } = new List<Expenses>();
        public decimal Budget { get; set; }
    }

}
