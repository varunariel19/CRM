using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Services
{
    namespace ArielCRM.Services
    {
        public class DocumentService(AppDbContext dbContext, IAppwriteStorageService appwriteService) : IDocumentService
        {
            private readonly AppDbContext _dbContext = dbContext;
            private readonly IAppwriteStorageService _appwriteService = appwriteService;

            public async Task<List<Documents>> UploadDocumentsAsync(List<IFormFile> files, string projectId)
            {
                if (files is null || files.Count == 0)
                    throw new ArgumentException("At least one file is required.");

                if (string.IsNullOrWhiteSpace(projectId))
                    throw new ArgumentException("projectId is required.");

                var projectExists = await _dbContext.Projects.AnyAsync(p => p.Id == projectId);
                if (!projectExists)
                    throw new ArgumentException($"Project '{projectId}' does not exist.");

                var uploadedDocuments = new List<Documents>();
                var uploadedFileIds = new List<string>();

                try
                {
                    foreach (var file in files)
                    {
                        if (file.Length == 0) continue;

                        var uploadResult = await _appwriteService.UploadFileAsync(file);
                        uploadedFileIds.Add(uploadResult.FileId);

                        uploadedDocuments.Add(new Documents
                        {
                            ProjectId = projectId,
                            UploadId = uploadResult.FileId,
                            FileName = file.FileName,
                            FileUrl = uploadResult.FileUrl,
                            UploadedAt = DateTime.UtcNow
                        });
                    }

                    _dbContext.Documents.AddRange(uploadedDocuments);
                    await _dbContext.SaveChangesAsync();
                }
                catch
                {
                    foreach (var fileId in uploadedFileIds)
                    {
                        await _appwriteService.DeleteFileAsync(fileId);
                    }
                    throw;
                }

                return uploadedDocuments;
            }

            public async Task<bool> DeleteDocumentAsync(string documentId)
            {
                if (string.IsNullOrWhiteSpace(documentId))
                    throw new ArgumentException("documentId is required.");

                var document = await _dbContext.Documents.FirstOrDefaultAsync(d => d.Id == documentId);

                if (document is null)
                {
                    return false;
                }

                _dbContext.Documents.Remove(document);
                await _dbContext.SaveChangesAsync();

                await _appwriteService.DeleteFileByUrlAsync(document.FileUrl);
                return true;
            }
        }
    }
}