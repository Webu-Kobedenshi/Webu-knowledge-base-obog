# Cloudflare R2 Deploy

アバター画像用の S3 互換ストレージを R2 で用意する手順です。

## Bucket

- Bucket name: `webu-portal`
- Public access は配信用ドメインに合わせて設定する

## API Token

R2 の S3 API 用 token を作成します。

必要な値:

```text
Access Key ID
Secret Access Key
S3 Endpoint
```

## Environment Variables

Fly.io の service に設定します。

```bash
flyctl secrets set \
  ENDPOINT="https://<account-id>.r2.cloudflarestorage.com" \
  PUBLIC_UPLOAD_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com" \
  PUBLIC_ENDPOINT="https://<your-r2-public-domain>" \
  ACCESS_KEY="<r2-access-key-id>" \
  SECRET_KEY="<r2-secret-access-key>" \
  BUCKET_NAME="webu-portal"
```

## CORS

ブラウザから署名付き URL へ `PUT` するため、R2 bucket に CORS を設定します。

```json
[
  {
    "AllowedOrigins": ["https://webu-portal-web.vercel.app"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Check

1. service を deploy する
2. `/account` からアバターをアップロードする
3. 保存された画像 URL が表示できる

## Common Issues

- `AllowedOrigins` が実際の Web URL と違う
- `PUBLIC_UPLOAD_ENDPOINT` がブラウザから到達できない
- `PUBLIC_ENDPOINT` が公開配信用 URL になっていない
