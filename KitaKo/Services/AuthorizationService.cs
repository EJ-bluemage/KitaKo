using KitaKo.Models;
using System.Security.Cryptography;
using System.Text;

namespace KitaKo.Services
{
    public class AuthService
    {
        //In-memory user storage (replace with database) DITO DATABASE
        private static List<User> _users = new List<User>();

        public User Register(string username, string email, string password)
        {
            //To check if user already exists
            if (_users.Any(u => u.Email == email || u.Username == username))
            {
                return null;
            }

            var user = new User
            {
                Id = _users.Count + 1,
                Username = username,
                Email = email,
                PasswordHash = HashPassword(password),
                CreatedAt = DateTime.Now
            };

            _users.Add(user);
            return user;
        }

        public User Login(string emailOrUsername, string password)
        {
            var user = _users.FirstOrDefault(u =>
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
    }
}