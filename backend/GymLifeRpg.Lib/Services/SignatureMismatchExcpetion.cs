using System.Security.Cryptography;

namespace GymLifeRpg.Lib.Services;

public class SignatureMismatchException(string message) : CryptographicException(message) { }
