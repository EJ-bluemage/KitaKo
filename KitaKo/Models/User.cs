namespace KitaKo.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string StoreName { get; set; } 
        public string ProfilePhotoUrl { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class LoginViewModel
    {
        public string EmailOrUsername { get; set; }
        public string Password { get; set; }
    }

    public class SignupViewModel
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }

    public class ProfileEditViewModel
    {
        public string Username { get; set; }
        public string StoreName { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ProfilePhotoUrl { get; set; }
        public IFormFile ProfilePhoto { get; set; }
    }
}