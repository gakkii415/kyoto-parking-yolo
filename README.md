# 京都パーキング観測室

https://gakkii415.github.io/kyoto-parking-yolo/?v=1

repository-creator経由で作成。スマホ向けのYOLO実験アプリ。

- YOLO11n-OBB（DOTAのsmall-vehicle / large-vehicle）を実際にブラウザ内で実行。
- 画像取り込み、ポリゴン範囲指定、信頼度閾値、検出枠、拡大、端末内の観測履歴とCSV。
- サンプルは京都・岩倉付近の国土地理院航空写真。衛星写真ではありません。撮影日不明。衛星写真もJPEG/PNG/WebPで取り込めます。
- 静止画内の車両数の推定。駐車中か走行中かは判別しません。リアルタイム衛星画像取得・定期巡回・クラウド保存はありません。

## 再現と公開

`.github/workflows/publish.yml` がCPU版PyTorchとUltralyticsを使用し、公式重みをONNXへ変換。GSI実画像を取得し、ONNX推論とブラウザ共通のデコーダーで実データ検証後にGitHub Pagesへ公開。モデル・WASM・JSは同じPagesから配信。画像アップロードはサーバー送信されません。

ビルド: `python scripts/build.py` → `node scripts/verify.mjs`。アプリ本体はweb/。ONNX入力 [1,3,640,640]、RGB/255、114のレターボックス。出力 [1,20,8400]。DOTA class 4/5、probabilistic IoU 0.5でNMS。公開verification.jsonはサンプル推論の機械検証結果であり目視正解ラベルではありません。

小さな車や影・樹木の遮蔽には誤検出/見逃しがあります。精度未評価。範囲の中心点判定、同一地点・同一範囲・同一閾値で比較してください。履歴はブラウザのlocalStorage最大100件。

## 出典・ライセンス

- 画像: [国土地理院タイル](https://maps.gsi.go.jp/development/ichiran.html)。元画像URLと取得時刻はsample.json。撮影日とHTTP更新日時を混同しない。
- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics): AGPL-3.0。本アプリもAGPL-3.0。
- [ONNX Runtime](https://github.com/microsoft/onnxruntime): MIT。
