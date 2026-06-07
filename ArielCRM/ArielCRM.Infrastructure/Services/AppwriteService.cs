using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ArielCRM.Infrastructure.Services
{
    public class AppwriteStorageService : IAppwriteStorageService
    {
        private readonly Storage _storage;
        private readonly AppwriteSettings _settings;

        public AppwriteStorageService(IOptions<AppwriteSettings> options)
        {
            _settings = options.Value;

            var client = new Client()
                .SetEndpoint(_settings.Endpoint)
                .SetProject(_settings.ProjectId)
                .SetKey(_settings.ApiKey);

            _storage = new Storage(client);
        }

        public async Task<UploadedFileResult> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required.");

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var uploadedFile = await _storage.CreateFile(
                bucketId: _settings.BucketId,
                fileId: ID.Unique(),
                file: InputFile.FromBytes(
                    memoryStream.ToArray(),
                    file.FileName,
                    file.ContentType
                )
            );

            var fileUrl = GetFileViewUrlAsync(uploadedFile.Id);

            return new UploadedFileResult
            {
                FileId = uploadedFile.Id,
                FileUrl = fileUrl
            };
        }

        public Task DeleteFileAsync(string fileId)
        {
            return _storage.DeleteFile(
                bucketId: _settings.BucketId,
                fileId: fileId
            );
        }

        private string GetFileViewUrlAsync(string fileId)
        {
            var url = $"{_settings.Endpoint}/storage/buckets/{_settings.BucketId}/files/{fileId}/view?project={_settings.ProjectId}";
            return url;
        }
    }

}