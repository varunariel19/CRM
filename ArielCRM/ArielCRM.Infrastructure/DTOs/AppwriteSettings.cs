namespace ArielCRM.Infrastructure.DTOs
{
public class AppwriteSettings
{
    public string Endpoint { get; set; } = string.Empty;
    public string ProjectName {get ;set;} = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string BucketId { get; set; } = string.Empty;
}

public class UploadedFileResult
{
    public string FileId { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
}

}