using Amazon.S3;
using Amazon.S3.Model;

namespace ShareNSpare.Api.Services;

public class StorageService
{
    private readonly AmazonS3Client _client;
    private readonly string _bucket;
    private readonly string _publicUrl;

    public StorageService()
    {
        var endpoint  = Environment.GetEnvironmentVariable("STORAGE_ENDPOINT")   ?? "http://localhost:9000";
        var accessKey = Environment.GetEnvironmentVariable("STORAGE_ACCESS_KEY") ?? "minioadmin";
        var secretKey = Environment.GetEnvironmentVariable("STORAGE_SECRET_KEY") ?? "minioadmin";
        _bucket    = Environment.GetEnvironmentVariable("STORAGE_BUCKET")     ?? "sharenspare-uploads";
        _publicUrl = Environment.GetEnvironmentVariable("STORAGE_PUBLIC_URL") ?? $"{endpoint}/{_bucket}";

        var config = new AmazonS3Config
        {
            ServiceURL = endpoint,
            ForcePathStyle = true,
            UseHttp = endpoint.StartsWith("http://")
        };

        _client = new AmazonS3Client(accessKey, secretKey, config);
    }

    public async Task EnsureBucketExists()
    {
        try
        {
            await _client.GetBucketLocationAsync(new GetBucketLocationRequest { BucketName = _bucket });
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            await _client.PutBucketAsync(new PutBucketRequest { BucketName = _bucket });

            var policy = $$"""
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::{{_bucket}}/*"]
                    }
                ]
            }
            """;
            await _client.PutBucketPolicyAsync(new PutBucketPolicyRequest
            {
                BucketName = _bucket,
                Policy = policy
            });
        }
        catch
        {
            // R2 buckets are created via the Cloudflare dashboard — ignore errors here
        }
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType)
    {
        var key = $"photos/{Guid.NewGuid()}/{fileName}";

        await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucket,
            Key = key,
            InputStream = stream,
            ContentType = contentType
        });

        return $"{_publicUrl.TrimEnd('/')}/{key}";
    }

    public async Task DeleteAsync(string url)
    {
        var prefix = $"{_publicUrl.TrimEnd('/')}/";
        if (!url.StartsWith(prefix)) return;

        var key = url[prefix.Length..];
        await _client.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _bucket,
            Key = key
        });
    }
}
