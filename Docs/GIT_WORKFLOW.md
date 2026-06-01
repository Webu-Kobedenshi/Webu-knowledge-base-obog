# Git Workflow

開発時の基本フローです。

## Branches

- `develop`: 日々の開発ブランチ
- `release`: 本番反映用の安定ブランチ

## Development Flow

1. `develop` から作業ブランチを作る
2. 実装、確認、コミットを行う
3. `develop` に Pull Request を出す
4. レビュー後に merge する

ブランチ名の例:

```text
feature/alumni-card-loading
fix/google-oauth-callback
docs/setup-readme
```

## Release Flow

1. `develop` で確認する
2. `release` に Pull Request を出す
3. merge 後に本番へ反映する

## Hotfix

本番で急ぎの修正が必要な場合:

1. `release` から `hotfix/*` を作る
2. 修正して `release` に merge する
3. 同じ修正を `develop` にも反映する

## Notes

- `release` へ直接 push しない
- Prisma migration は必ず commit に含める
- 動作確認に使ったコマンドは PR に書く
