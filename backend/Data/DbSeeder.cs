using Microsoft.EntityFrameworkCore;
using TatliBisey.Api.Models;

namespace TatliBisey.Api.Data;

/// <summary>Yerel geliştirme için örnek veri. Tablo doluysa tekrar eklemez.</summary>
public static class DbSeeder
{
    public const string AdminEmail = "admin@tatlibisey.com";
    public const string AdminPassword = "Admin123!";
    public const string DemoCustomerEmail = "ayse@example.com";
    public const string DemoCustomerPassword = "Demo123!";

    public static async Task SeedAsync(AppDbContext db, ILogger logger)
    {
        if (await db.Categories.AnyAsync())
        {
            return;
        }

        logger.LogInformation("Örnek veriler yükleniyor...");

        var categories = new List<Category>
        {
            new() { Name = "Pastalar", Slug = "pastalar", SortOrder = 1 },
            new() { Name = "Kurabiye & Makaron", Slug = "kurabiye-makaron", SortOrder = 2 },
            new() { Name = "Çikolatalar", Slug = "cikolatalar", SortOrder = 3 },
            new() { Name = "Hamur İşleri", Slug = "hamur-isleri", SortOrder = 4 },
            new() { Name = "Şerbetli Tatlılar", Slug = "serbetli-tatlilar", SortOrder = 5 }
        };
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();

        var pastalar = categories[0];
        var kurabiye = categories[1];
        var cikolatalar = categories[2];
        var hamur = categories[3];
        var serbetli = categories[4];

        Product CreateProduct(
            string name,
            string slug,
            string description,
            decimal price,
            decimal? discountPrice,
            int stock,
            Category category,
            params string[] images)
        {
            return new Product
            {
                Name = name,
                Slug = slug,
                Description = description,
                Price = price,
                DiscountPrice = discountPrice,
                Stock = stock,
                Category = category,
                Images = images
                    .Select((url, index) => new ProductImage { Url = url, SortOrder = index })
                    .ToList()
            };
        }

        db.Products.AddRange(
            CreateProduct("Çikolatalı Pasta", "cikolatali-pasta",
                "Yoğun bitter çikolatalı ganaj ve yumuşak kakao pandispanya ile hazırlanan imza pastamız. 6-8 kişilik, dilimlenmeye hazır olarak teslim edilir.",
                480m, 399m, 24, pastalar,
                "/uploads/seed/cikolatali-pasta-1.jpg", "/uploads/seed/cikolatali-pasta-2.jpg"),
            CreateProduct("Frambuazlı Cheesecake", "frambuazli-cheesecake",
                "Kremamsı peynir dolgusu, tereyağlı bisküvi tabanı ve taze frambuaz sosu. Buzdolabında 3 gün boyunca tazeliğini korur.",
                420m, null, 12, pastalar,
                "/uploads/seed/cheesecake-1.jpg", "/uploads/seed/cheesecake-2.jpg"),
            CreateProduct("Klassik Tiramisu", "klassik-tiramisu",
                "Mascarpone kreması, espresso ile ıslatılmış kedidili bisküvi ve bol kakao. Her sabah taze hazırlanır.",
                390m, 350m, 18, pastalar,
                "/uploads/seed/tiramisu-1.jpg", "/uploads/seed/tiramisu-2.jpg"),
            CreateProduct("Limonlu Tart", "limonlu-tart",
                "İncecik tart hamuru üzerinde limon kreması ve İtalyan meringue. Hafif ekşi, ferahlatıcı bir bitiş.",
                360m, null, 0, pastalar,
                "/uploads/seed/limonlu-tart-1.jpg", "/uploads/seed/limonlu-tart-2.jpg"),
            CreateProduct("Makaron Kutusu (12'li)", "makaron-kutusu",
                "Fıstık, frambuaz, vanilya ve bitter çikolata aromalarından oluşan 12 adet makaron. Hediye kutusunda teslim edilir.",
                320m, 279m, 30, kurabiye,
                "/uploads/seed/makaron-1.jpg", "/uploads/seed/makaron-2.jpg"),
            CreateProduct("Çikolatalı Kurabiye (6'lı)", "cikolatali-kurabiye",
                "Dışı hafif çıtır, içi yumuşak; orijinal bitter çikolata parçacıklı tereyağlı kurabiye. Pakette 6 adet bulunur.",
                180m, null, 40, kurabiye,
                "/uploads/seed/kurabiye-1.jpg", "/uploads/seed/kurabiye-2.jpg"),
            CreateProduct("Fındıklı Brownie", "findikli-brownie",
                "Yoğun kakao, eritilmiş bitter çikolata ve kavrulmuş fındık. Hafifçe ısıtıp dondurmayla servis etmenizi öneririz.",
                260m, 229m, 15, cikolatalar,
                "/uploads/seed/brownie-1.jpg", "/uploads/seed/brownie-2.jpg"),
            CreateProduct("Antep Fıstıklı Baklava (1 kg)", "antep-fistikli-baklava",
                "İnce açılmış yufka katmanları, bol Antep fıstığı ve doğal şerbet. Günlük üretim, 1 kg tepside gönderilir.",
                550m, 499m, 8, serbetli,
                "/uploads/seed/baklava-1.jpg", "/uploads/seed/baklava-2.jpg"),
            CreateProduct("Tuzlu Karamelli Ekler", "tuzlu-karamelli-ekler",
                "Choux hamuru, vanilyalı pastacı kreması ve tuzlu karamel kaplama. Kutuda 3 adet.",
                240m, null, 20, hamur,
                "/uploads/seed/ekler-1.jpg", "/uploads/seed/ekler-2.jpg"),
            CreateProduct("Limonlu Profiterol", "limonlu-profiterol",
                "İçi limonlu krema ile dolu profiterol topları, beyaz çikolata sosu ve rendelenmiş limon kabuğu.",
                340m, null, 3, hamur,
                "/uploads/seed/profiterol-1.jpg", "/uploads/seed/profiterol-2.jpg"));

        db.PaymentMethodSettings.AddRange(
            new PaymentMethodSetting
            {
                Method = PaymentMethod.BankTransfer,
                IsActive = true,
                SortOrder = 1,
                BankName = "Ziraat Bankası",
                Iban = "TR00 0000 0000 0000 0000 0000 00",
                AccountHolder = "Tatlı Bi'şey Gıda San. Ltd. Şti.",
                Instructions = "Sipariş numaranızı açıklama alanına yazmanız yeterli. Havaleniz onaylandığında siparişiniz hazırlanmaya başlar."
            },
            new PaymentMethodSetting
            {
                Method = PaymentMethod.CashOnDelivery,
                IsActive = true,
                SortOrder = 2,
                Instructions = "Kapıda nakit veya kredi kartı ile ödeme. Kargo görevlisine sipariş tutarını ödeyin."
            },
            new PaymentMethodSetting
            {
                Method = PaymentMethod.CreditCard,
                IsActive = true,
                SortOrder = 3,
                Instructions = "Sanal POS entegrasyonu henüz bağlı değil. Sipariş kaydı oluşturulur, ödeme yönetim panelinden takip edilir."
            });

        var admin = new AdminUser
        {
            FullName = "Mağaza Yöneticisi",
            Email = AdminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword)
        };
        db.AdminUsers.Add(admin);

        var customer = new Customer
        {
            FullName = "Ayşe Yılmaz",
            Email = DemoCustomerEmail,
            Phone = "0532 000 00 00",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoCustomerPassword),
            CreatedAt = DateTime.UtcNow.AddDays(-40)
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        var products = await db.Products.Include(p => p.Images).ToListAsync();
        Product P(string slug) => products.First(p => p.Slug == slug);

        Order CreateOrder(string customerName, string email, string phone, string address, string city,
            string district, string paymentMethod, string paymentStatus, string status, DateTime createdAt,
            params (string Slug, int Quantity)[] items)
        {
            var orderItems = items.Select(item =>
            {
                var product = P(item.Slug);
                return new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ImageUrl = product.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.Url,
                    UnitPrice = product.FinalPrice,
                    Quantity = item.Quantity
                };
            }).ToList();

            var subtotal = orderItems.Sum(i => i.UnitPrice * i.Quantity);

            return new Order
            {
                OrderNumber = Common.OrderNumber.Create(),
                CustomerId = customer.Id,
                CustomerName = customerName,
                Email = email,
                Phone = phone,
                Address = address,
                City = city,
                District = district,
                PaymentMethod = Enum.Parse<PaymentMethod>(paymentMethod),
                PaymentStatus = Enum.Parse<PaymentStatus>(paymentStatus),
                Status = Enum.Parse<OrderStatus>(status),
                Subtotal = subtotal,
                ShippingTotal = 0,
                Total = subtotal,
                CreatedAt = createdAt,
                UpdatedAt = createdAt.AddHours(2),
                Items = orderItems
            };
        }

        var demoOrders = new List<Order>
        {
            CreateOrder("Ayşe Yılmaz", DemoCustomerEmail, "0532 000 00 00",
                "Caferağa Mah. Moda Cad. No: 12 D:4", "İstanbul", "Kadıköy",
                nameof(PaymentMethod.BankTransfer), nameof(PaymentStatus.Paid), nameof(OrderStatus.Completed),
                DateTime.UtcNow.AddDays(-18), ("antep-fistikli-baklava", 1), ("cikolatali-pasta", 1)),
            CreateOrder("Ayşe Yılmaz", DemoCustomerEmail, "0532 000 00 00",
                "Caferağa Mah. Moda Cad. No: 12 D:4", "İstanbul", "Kadıköy",
                nameof(PaymentMethod.CreditCard), nameof(PaymentStatus.Paid), nameof(OrderStatus.Shipped),
                DateTime.UtcNow.AddDays(-5), ("makaron-kutusu", 2), ("klassik-tiramisu", 1)),
            CreateOrder("Ayşe Yılmaz", DemoCustomerEmail, "0532 000 00 00",
                "Caferağa Mah. Moda Cad. No: 12 D:4", "İstanbul", "Kadıköy",
                nameof(PaymentMethod.BankTransfer), nameof(PaymentStatus.AwaitingConfirmation), nameof(OrderStatus.Pending),
                DateTime.UtcNow.AddDays(-1), ("findikli-brownie", 1), ("cikolatali-kurabiye", 2))
        };

        db.Orders.AddRange(demoOrders);
        await db.SaveChangesAsync();

        logger.LogInformation("Örnek veriler hazır: {ProductCount} ürün, {OrderCount} sipariş", products.Count, demoOrders.Count);
    }
}
