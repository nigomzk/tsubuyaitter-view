このアプリケーションは自己学習のためのTwitterクローンアプリケーションです。

## 開発環境の構築

開発環境を構築するには以下の手順を実行してください。

Gitリポジトリをクローンします。

```bash
git clone git@github.com:nigomzk/tsubuyaitter-view.git
cd tsubuyaitter-view
```

コンテナをビルドし、起動します。

```bash
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

DBを初期化します。
```bash
// モデルを再生成する
npx prisma generate

// データベースに反映する
npx prisma migrate dev

// 初期データを投入する
npx prisma db seed
```

MinIOのバケットポリシーを設定します。

```bash
// AWSプロファイル設定
aws configure --profile minio
AWS Access Key ID [None]: minioadmin
AWS Secret Access Key [None]: minioadmin
Default region name [None]: ap-northeast-1
Default output format [None]: json

// バケット作成
aws --profile minio s3 mb s3://tsubuyaitter-images

// バケットポリシー設定
aws --profile minio s3api put-bucket-policy --bucket tsubuyaitter-images --policy file://./infra/s3/buckets/tsubuyaitter-images/bucket-policy.json

// Redisコンテナに入る
docker container exec -it redis bash

// エイリアス設定を変更する
mc alias set local http://minio:9000 minioadmin minioadmin

// バケットを公開設定に変更する
mc anonymous set download local/tsubuyaitter-images

// Redisコンテナから出る
exit
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。


## DBスキーマの修正

`prisma/schema.prisma`を修正した場合は、`prisma/migrations`を削除の上、以下のコマンドを実行してください。

```bash
// モデルを再生成する
npx prisma generate

// データベースとテーブルを初期化する
npx prisma migrate reset

// データベースに反映する
npx prisma migrate dev

// 初期データを投入する
npx prisma db seed
```