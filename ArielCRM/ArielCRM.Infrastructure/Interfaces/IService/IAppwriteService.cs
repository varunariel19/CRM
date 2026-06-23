using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.Interfaces.IService
{

    public interface IAppwriteStorageService
    {
        Task<UploadedFileResult> UploadFileAsync(IFormFile file);
        Task DeleteFileAsync(string fileId);
        Task DeleteFileByUrlAsync(string? fileUrl);
    }

}