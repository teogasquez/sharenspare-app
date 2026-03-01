using Amazon.S3;
using Amazon.S3.Model;

namespace ShareNSpare.Api.Services;

public class StorageService
{
    private readonly AmazonS3Client _client;
    private readonly string _bucket;

    public StorageService()
    {
        var endpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT") ?? "http://localhost:9000";
        var accessKey = Environment.GetEnvironmentVariable("MINIO_ROOT_USER") ?? "minioadmin";
        var secretKey = Environment.GetEnvironmentVariable("MINIO_ROOT_PASSWORD") ?? "minioadmin";
        _bucket = Environment.GetEnvironmentVariable("MINIO_BUCKET") ?? "sharenspare-uploads";

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

            // Set bucket policy to public read
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

        var endpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT") ?? "http://localhost:9000";
        return $"{endpoint}/{_bucket}/{key}";
    }

    public async Task DeleteAsync(string url)
    {
        var endpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT") ?? "http://localhost:9000";
        var prefix = $"{endpoint}/{_bucket}/";
        if (!url.StartsWith(prefix)) return;

        var key = url[prefix.Length..];
        await _client.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _bucket,
            Key = key
        });
    }
}
