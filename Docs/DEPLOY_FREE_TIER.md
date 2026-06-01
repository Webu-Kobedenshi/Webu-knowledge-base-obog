# Deploy Overview

本番環境で使うサービスの全体像です。

## Services

- Web: Vercel
- API: Fly.io
- Database: Neon
- Image Storage: Cloudflare R2

## Cost Notes

- Vercel はビルド回数、帯域、実行時間で無料枠を超える可能性があります
- Fly.io はマシン稼働時間とリソース使用量で課金されます
- Neon は容量、接続、利用時間で無料枠を超える可能性があります
- R2 は保存容量、リクエスト数、転送量で課金されます

## Related Docs

- [Vercel Deploy](./DEPLOY_VERCEL.md)
- [Fly.io Deploy](./DEPLOY_FLYIO.md)
- [Neon Deploy](./DEPLOY_NEON.md)
- [Cloudflare R2 Deploy](./DEPLOY_R2.md)
