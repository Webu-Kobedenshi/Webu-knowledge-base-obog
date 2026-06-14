# Git Workflow

開発時の基本フローです。

## Branches

- `main`: 本番反映用の安定ブランチ。Xserver はこのブランチからデプロイする
- 作業ブランチ: 機能追加や修正ごとに `main` から作る

## Development Flow

1. `main` から作業ブランチを作る
2. 実装、確認、コミットを行う
3. `main` に Pull Request を出す
4. レビュー後に merge する

ブランチ名の例:

```text
feature/alumni-card-loading
fix/google-oauth-callback
docs/setup-readme
```

## Release Flow

1. `main` に Pull Request を merge する
2. Xserver 上で `main` を pull する
3. `docker compose -f compose.xserver.yml up -d --build` で本番へ反映する

具体的なデプロイ手順は [XSERVER_DEPLOY_RUNBOOK.md](./XSERVER_DEPLOY_RUNBOOK.md) を参照してください。

## Hotfix

本番で急ぎの修正が必要な場合:

1. `main` から `hotfix/*` を作る
2. 修正して `main` に merge する
3. Xserver へ再デプロイする

## Notes

- `main` へ直接 push しない
- Prisma migration は必ず commit に含める
- 動作確認に使ったコマンドは PR に書く
