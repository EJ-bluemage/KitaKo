using Microsoft.AspNetCore.Mvc;
using KitaKo.Models;
using KitaKo.Services;
using KitaKo.Data;
using System.Collections.Generic;

namespace KitaKo.Controllers
{
    public class HomeController : Controller
    {
        private readonly KnapsackService _knapsackService;
        private readonly AuthService _authService;
        private readonly ApplicationDbContext _dbContext;

        public HomeController(ApplicationDbContext dbContext)
        {
            _knapsackService = new KnapsackService();
            _dbContext = dbContext;
            _authService = new AuthService(dbContext);
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

        // API endpoint to save sale (connect with database)
        [HttpPost]
        public JsonResult AddSale([FromBody] Sale sale)
        {
            try
            {
                var userId = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "User not logged in" });
                }

                sale.UserId = int.Parse(userId);
                sale.Date = DateTime.UtcNow;
                _dbContext.Sales.Add(sale);
                _dbContext.SaveChanges();
                return Json(new { success = true, sale });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API endpoint to save utang
        [HttpPost]
        public JsonResult AddUtang([FromBody] Utang utang)
        {
            try
            {
                var userId = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "User not logged in" });
                }

                utang.UserId = int.Parse(userId);
                utang.CreatedDate = DateTime.UtcNow;
                _dbContext.Utangs.Add(utang);
                _dbContext.SaveChanges();
                return Json(new { success = true, utang });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API endpoint to mark utang as paid
        [HttpPost]
        public JsonResult MarkUtangPaid(int id)
        {
            try
            {
                var utang = _dbContext.Utangs.FirstOrDefault(u => u.Id == id);
                if (utang == null)
                {
                    return Json(new { success = false, message = "Utang not found" });
                }

                utang.Paid = true;
                _dbContext.SaveChanges();
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API endpoint to add expense
        [HttpPost]
        public JsonResult AddExpense([FromBody] Expenses expense)
        {
            try
            {
                var userId = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "User not logged in" });
                }

                expense.UserId = int.Parse(userId);
                expense.CreatedDate = DateTime.UtcNow;
                _dbContext.Expenses.Add(expense);
                _dbContext.SaveChanges();
                return Json(new { success = true, expense });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
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
            try
            {
                var expense = _dbContext.Expenses.FirstOrDefault(e => e.Id == id);
                if (expense == null)
                {
                    return Json(new { success = false, message = "Expense not found" });
                }

                expense.Paid = true;
                _dbContext.SaveChanges();
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // API endpoint to delete expense
        [HttpPost]
        public JsonResult DeleteExpense(int id)
        {
            try
            {
                var expense = _dbContext.Expenses.FirstOrDefault(e => e.Id == id);
                if (expense == null)
                {
                    return Json(new { success = false, message = "Expense not found" });
                }

                _dbContext.Expenses.Remove(expense);
                _dbContext.SaveChanges();
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        //Go to Login
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        //Login
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

        //Go to Signup
        [HttpGet]
        public IActionResult Signup()
        {
            return View();
        }

        //Signup
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

        // GET: Profile
        public IActionResult Profile()
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr))
            {
                return RedirectToAction("Login");
            }

            var userId = int.Parse(userIdStr);
            var user = _authService.GetUserById(userId);

            if (user == null)
            {
                return RedirectToAction("Login");
            }

            return View(user);
        }

        // GET: Edit Profile
        [HttpGet]
        public IActionResult EditProfile()
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr))
            {
                return RedirectToAction("Login");
            }

            var userId = int.Parse(userIdStr);
            var user = _authService.GetUserById(userId);

            if (user == null)
            {
                return RedirectToAction("Login");
            }

            var model = new ProfileEditViewModel
            {
                Username = user.Username,
                StoreName = user.StoreName,
                ProfilePhotoUrl = user.ProfilePhotoUrl
            };

            return View(model);
        }



        //Edit Profile
        [HttpPost]
        public IActionResult EditProfile(ProfileEditViewModel model)
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr))
            {
                return RedirectToAction("Login");
            }

            var userId = int.Parse(userIdStr);

            // Get current user data
            var currentUser = _authService.GetUserById(userId);
            if (currentUser == null)
            {
                return RedirectToAction("Login");
            }

            //update username if it's provided and different
            string usernameToUpdate = string.IsNullOrWhiteSpace(model.Username)
                ? currentUser.Username
                : model.Username.Trim();

            //update store name if it's provided
            string storeNameToUpdate = model.StoreName ?? currentUser.StoreName;

            //update photo if it's provided
            string photoUrlToUpdate = currentUser.ProfilePhotoUrl; // Default to existing photo
            if (model.ProfilePhoto != null && model.ProfilePhoto.Length > 0)
            {
                var photoUrl = _authService.SaveProfilePhoto(model.ProfilePhoto, userId);
                if (!string.IsNullOrEmpty(photoUrl))
                {
                    photoUrlToUpdate = photoUrl;
                }
            }

            //Update profile
            var success = _authService.UpdateProfile(userId, usernameToUpdate, storeNameToUpdate, photoUrlToUpdate);

            if (!success)
            {
                ModelState.AddModelError("", "Username already taken");
                return View(model);
            }

            //BOTH current and new passwords must be providef
            if (!string.IsNullOrEmpty(model.CurrentPassword) && !string.IsNullOrEmpty(model.NewPassword))
            {
                var passwordChanged = _authService.ChangePassword(userId, model.CurrentPassword, model.NewPassword);
                if (!passwordChanged)
                {
                    ModelState.AddModelError("", "Current password is incorrect");
                    //Reload the user data to show
                    var updatedUser = _authService.GetUserById(userId);
                    model.Username = updatedUser.Username;
                    model.StoreName = updatedUser.StoreName;
                    model.ProfilePhotoUrl = updatedUser.ProfilePhotoUrl;
                    return View(model);
                }
            }

            //Updated with new username
            HttpContext.Session.SetString("Username", usernameToUpdate);
            TempData["SuccessMessage"] = "Profile updated successfully!";
            return RedirectToAction("Profile");
        }

        // About
        public IActionResult About()
        {
            return View();
        }
    }

    //Request model for optimization
    public class OptimizationRequest
    {
        public List<Expenses> Expenses { get; set; } = new List<Expenses>();
        public decimal Budget { get; set; }
    }

}