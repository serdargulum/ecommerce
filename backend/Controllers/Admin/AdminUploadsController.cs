using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/uploads")]
[Authorize(Roles = "Admin")]
public class AdminUploadsController(ImageStorage imageStorage) : ControllerBase
{
    [HttpPost]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<UploadResultDto>> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return BadRequest(new { message = "Dosya seçilmedi." });
        }

        var url = await imageStorage.SaveAsync(file, cancellationToken);
        return Ok(new UploadResultDto(url));
    }
}
