using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using System.Collections.Generic;

namespace KitaKo.Controllers
{
    public class HomeController : Controller
    {
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

        // Expense Priority Page (NEW)
        public IActionResult ExpensePriority()
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
    }
}
