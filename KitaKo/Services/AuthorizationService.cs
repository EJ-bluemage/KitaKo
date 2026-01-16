using KitaKo.Models;
using KitaKo.Data;
using System.Security.Cryptography;
using System.Text;

namespace KitaKo.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _dbContext;

        public AuthService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public User Register(string username, string email, string password)
        {
            //To check if user already exists
            if (_dbContext.Users.Any(u => u.Email == email || u.Username == username))
            {
                return null;
            }

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = HashPassword(password),
                CreatedAt = DateTime.Now
            };

            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();
            return user;
        }

        public User Login(string emailOrUsername, string password)
        {
            var user = _dbContext.Users.FirstOrDefault(u =>
                u.Email == emailOrUsername || u.Username == emailOrUsername);

            if (user != null && VerifyPassword(password, user.PasswordHash))
            {
                return user;
            }

            return null;
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        public User GetUserById(int userId)
        {
            return _dbContext.Users.FirstOrDefault(u => u.Id == userId);
        }

        public bool UpdateProfile(int userId, string username, string storeName, string profilePhotoUrl)
        {
            var user = _dbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return false;

            // Check if username is taken by another user
            if (_dbContext.Users.Any(u => u.Username == username && u.Id != userId))
            {
                return false;
            }

            user.Username = username;
            user.StoreName = storeName;
            user.ProfilePhotoUrl = profilePhotoUrl;
            _dbContext.SaveChanges();
            return true;
        }

        public bool ChangePassword(int userId, string currentPassword, string newPassword)
        {
            var user = _dbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return false;

            if (!VerifyPassword(currentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = HashPassword(newPassword);
            _dbContext.SaveChanges();
            return true;
        }

        public string SaveProfilePhoto(IFormFile photo, int userId)
        {
            if (photo == null || photo.Length == 0)
                return null;

            // Create profiles folder if it doesn't exist
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate filename
            var fileExtension = Path.GetExtension(photo.FileName);
            var fileName = $"user_{userId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                photo.CopyTo(stream);
            }

            // Return relative path for URL
            return $"/uploads/profiles/{fileName}";
        }
    }
}