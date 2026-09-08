# YOLO 人物検出モニター (v2)

https://gakkii415.github.io/kyoto-parking-yolo/?v=2

repository-creator経由で作成した既存リポジトリを、ユーザーの要望に合わせて人物検出へ変更。
固定カメラの公開録画を1本読み込み、ブラウザ内のYOLO11nで人物を検出します。

- 手動アップロード不要。開始ボタンで録画と推論を開始。
- 人物の枠・信頼度・そのコマの人数。一時停止・再生位置・最初から・判定閾値。
- 人物枠を同じ解析コマに重ねるため、表示更新は推論速度に依存します。
- 録画のループ再生です。ライブ監視・京都の映像・累計来客数・バックグラウンド記録ではありません。

## Build and validation

GitHub ActionsでUltralytics 8.3.160 / torch 2.5.1 CPUを用いてYOLO11nを640px ONNXへ出力。
`python scripts/build.py`が動画、モデル、ONNX Runtime Web 1.20.1を同じPages配信元に配置。
`node scripts/verify.mjs`が複数の実映像コマの検出結果を参照実装と比較し、出荷するWeb WASMでも推論します。
ビルド検証の結果は `verification.json`。毎回のブラウザ推論で計算し、検出結果の事前書き込みはしません。

## Sources / licenses

- Video: Intel, [sample-videos](https://github.com/intel-iot-devkit/sample-videos), commit `57978890822836f2b4743852f04f62fc511757e4`, CC BY 4.0. 動画は元ファイルを使用し、表示時に枠を追加。
- YOLO11n: Ultralytics / AGPL-3.0. This app is AGPL-3.0.
- ONNX Runtime Web: Microsoft / MIT.

## Scope and review

映像・検出・人数が同じ場所で分かる構成を採用。説明・ライセンスは折りたたみ。
複数カメラ、ライブ配信、履歴は今回の「まず一つの動画で試す」範囲外。
ブラウザでの画面検証は今回未実施。既存 `browser-smoke.mjs` はv1駐車場専用の過去検証で、v2の検証結果ではありません。
