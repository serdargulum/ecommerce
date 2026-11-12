using System.Globalization;
using System.Text;

namespace Ecommerce.Api.Common;

public static class SlugHelper
{
    private static readonly Dictionary<char, char> TurkishMap = new()
    {
        ['ç'] = 'c', ['ğ'] = 'g', ['ı'] = 'i', ['ö'] = 'o', ['ş'] = 's', ['ü'] = 'u',
        ['Ç'] = 'c', ['Ğ'] = 'g', ['İ'] = 'i', ['Ö'] = 'o', ['Ş'] = 's', ['Ü'] = 'u'
    };

    public static string Create(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(input.Length);
        foreach (var character in input.Trim())
        {
            var normalized = TurkishMap.TryGetValue(character, out var mapped) ? mapped : character;
            var decomposed = normalized.ToString().Normalize(NormalizationForm.FormD);
            foreach (var part in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(part) == UnicodeCategory.NonSpacingMark)
                {
                    continue;
                }

                builder.Append(char.IsLetterOrDigit(part) ? char.ToLowerInvariant(part) : '-');
            }
        }

        var slug = string.Join('-', builder.ToString().Split('-', StringSplitOptions.RemoveEmptyEntries));
        return slug.Length > 170 ? slug[..170].Trim('-') : slug;
    }
}
