using ArielCRM.DataLayer.Entities;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.Interfaces.IService
{
  public interface IDocumentService
    {
        Task<bool> DeleteDocumentAsync(string documentId);
       Task<List<Documents>> UploadDocumentsAsync(List<IFormFile> files, string projectId);
    }
}