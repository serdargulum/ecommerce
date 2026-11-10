using System.Security.Cryptography;

namespace TatliBisey.Api.Common;

public static class OrderNumber
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    /// <summary>Örn. TB261110-7K4P</summary>
    public static string Create()
    {
        var suffix = new char[4];
        for (var i = 0; i < suffix.Length; i++)
        {
            suffix[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];
        }

        return $"TB{DateTime.UtcNow:yyMMdd}-{new string(suffix)}";
    }
}
