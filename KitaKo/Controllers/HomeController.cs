using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Services;
using System.Collections.Generic;

namespace KitaKo.Controllers
{
    public class HomeController : Controller
    {
        private readonly KnapsackService _knapsackService;

        private readonly AuthService _authService;

        public HomeController()
        {
            _knapsackService = new KnapsackService();
            _authService = new AuthService();
        }

        // Landing Page
        public IActionResult Index()
        {
            return View();
        }

        // Dashboard
        public IActionResult Dashboard()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login");
            }

            ViewBag.Username = HttpContext.Session.GetString("Username");
            return View();
        }

        // Sales & Budget Page
        public IActionResult SalesTracker()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login");
            }
            return View();
        }

        // Utang Logs Page
        public IActionResult UtangLogs()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login");
            }
            return View();
        }

        // Expenses Page
        public IActionResult Expenses()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login");
            }
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

        // GET: Login
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        // POST: Login
        [HttpPost]
        public IActionResult Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = _authService.Login(model.EmailOrUsername, model.Password);

                if (user != null)
                {
                    HttpContext.Session.SetString("UserId", user.Id.ToString());
                    HttpContext.Session.SetString("Username", user.Username);

                    TempData["SuccessMessage"] = $"Welcome back, {user.Username}!";
                    return RedirectToAction("Dashboard");
                }

                ModelState.AddModelError("", "Invalid email/username or password");
            }
            return View(model);
        }

        // GET: Signup
        [HttpGet]
        public IActionResult Signup()
        {
            return View();
        }

        // POST: Signup
        [HttpPost]
        public IActionResult Signup(SignupViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (model.Password != model.ConfirmPassword)
                {
                    ModelState.AddModelError("", "Passwords do not match");
                    return View(model);
                }

                var user = _authService.Register(model.Username, model.Email, model.Password);

                if (user != null)
                {
                    TempData["SuccessMessage"] = "Account created successfully! Please login.";
                    return RedirectToAction("Login");
                }

                ModelState.AddModelError("", "Username or email already exists");
            }
            return View(model);
        }

        // Logout
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            TempData["SuccessMessage"] = "You have been logged out successfully.";
            return RedirectToAction("Index");
        }
    }

    // Request model for optimization
    public class OptimizationRequest
    {
        public List<Expenses> Expenses { get; set; } = new List<Expenses>();
        public decimal Budget { get; set; }
    }

}
