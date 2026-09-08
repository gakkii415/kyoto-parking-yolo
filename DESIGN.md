# Design

<!-- repository-creator:managed:start -->

## Role

成果物のデザイン全般を扱う。主対象は、視覚表現、UI / UX、情報階層、レイアウト、タイポグラフィ、色彩、余白、密度、操作の見せ方、レスポンシブ、状態表現、モーションなど。機能そのものは `FEATURES.md`、提供内容と文言は `CONTENT.md` の責務とする。

## Goal

プロダクト固有の目的、利用者、内容に合った高品質なデザインを作る。

単に整っている、現代的、ミニマルであることを完成条件にしない。AIが学習データ上の頻出パターンへ収束して作ったような、ブランド非依存・用途非依存・テンプレート的な画面を避け、人間のプロダクトチームが目的と理由を持って設計・反復したような完成度を目指す。

Anti-slopは見た目の禁止リストではない。目的は、AIらしい記号を消すことではなく、**プロダクト固有の設計判断を増やし、理由のないデフォルト判断を減らすこと**である。

## Operating Contract

- ピクセルやコンポーネントから始めない。最初に、誰が、どの状況で、何を達成するために使うかを確認する。
- 画面を作る前に、その画面で最優先される情報、操作、結果を決める。
- 「modern」「clean」「premium」「sleek」などの形容詞だけをデザイン方針として使用しない。構造、密度、文字、色、余白、形状、操作など、実装判断へ変換できる具体性を持たせる。
- 既存プロダクトでは、現在の有効な設計判断と利用者の慣れを尊重する。理由なく全面刷新しない。
- 新規UIまたは大きな再設計では、最初に思いついたもっともらしい構成をそのまま採用しない。少なくとも構造的に異なる複数の方向を比較し、プロダクトの主要タスクと内容に最も合うものを選ぶ。
- コンポーネントライブラリやCSSフレームワークは実装手段として使ってよいが、その初期見た目やサンプル構成をプロダクトのデザインとしてそのまま採用しない。
- 各画面、各セクション、各装飾は「何のために存在するか」を説明できる状態にする。説明できない要素は削除・統合・再設計を検討する。

## Design Read Before Implementation

新規UI、主要画面の追加、大きなデザイン変更では、コードを書く前に現在分かる範囲で次を整理する。

- Product type: 何のプロダクトか
- User: 主な利用者と技術習熟度
- Context: いつ、どの端末で、どの程度の時間をかけて使うか
- Primary task: 最重要の操作または判断
- Primary object: ユーザーが扱う中心的な対象
- Information density: 疎・標準・高密度のどれが適切か
- Trust requirement: 金額、個人情報、業務操作など、誤操作や誤解への慎重さ
- Desired impression: どのような印象が必要か。ただし抽象語だけで終わらせない
- Existing language: 既存の色、文字、部品、レイアウト、操作慣習のうち維持すべきもの
- References: 指定または調査した実在プロダクト

情報が不足していても合理的に推定できる場合は作業を止めず、必要な前提を短く置いて進める。

## Concrete Design Direction

実装前に、今回のUIで少なくとも次の判断を決める。すでに既存デザインシステムで決まっている項目はそれを使用する。

### Structure

- 主要タスクを最短で理解・実行できる情報構造
- ナビゲーション、主要領域、補助領域の関係
- 画面内で最も強く見せる対象と、視覚的に後退させる対象
- DesktopとMobileで何を維持し、何を再配置・省略・段階表示するか

### Typography

- 本文、ラベル、見出し、数値、コードなど役割ごとの階層
- フォントファミリー、ウェイト、サイズ、行間、字間の使い分け
- 大見出しだけを極端に巨大化して階層を作らない
- フォント選択を流行やAIの頻出デフォルトだけで決めない。既存ブランド、可読性、用途、言語を優先する

### Color

- 背景、本文、弱い情報、境界、主要アクション、状態色の役割
- アクセント色を装飾として散らさず、注意・操作・ブランドなど意味を持たせる
- グラデーションや発光表現を使う場合は、その画面で果たす役割を説明できること

### Spacing and Density

- 既存システムがなければ少数の一貫した間隔単位を基準にする
- すべてを均等な余白で離さず、関係が強い情報は近づけ、弱いものは離す
- 情報量の多いプロダクトを「余白を増やせば高級になる」という理由で不必要に低密度化しない
- 逆に、重要度の異なる情報を同じ密度で並べない

### Shape, Border, Shadow and Surface

- 角丸、境界線、背景面、影は階層・グルーピング・浮上状態などの役割に使う
- すべての要素をカードや角丸コンテナへ入れない
- 同じ画面で複数のradius、shadow、border表現を理由なく増やさない
- 平面で表現できる関係を、見た目を豪華にするためだけに浮かせない

### Icons and Imagery

- アイコンは認識、操作、状態理解を助ける場合に使う
- 同じ意味を文章とアイコンで無意味に重複しない
- 汎用アイコンを装飾として大量配置しない
- 画像、イラスト、図版は内容またはブランドに固有の役割を持たせる

### Motion

- モーションは状態変化、空間関係、操作結果、ブランド表現を理解しやすくする場合に使う
- すべてのカードをhoverで浮かせる、すべての要素へtransformを付けるなど、意味のない一括アニメーションをしない
- `prefers-reduced-motion` など利用者設定を尊重する

## Productive Friction for New or Major UI

新規UIまたは大きな再設計では、実装前に少なくとも2つの**構造的に異なる**方向を内部で比較する。

色だけ変えた案、角丸だけ変えた案は別方向として数えない。比較するのは、例えば次のような違いである。

- 主要情報の置き場所
- 画面の重心
- ナビゲーション方式
- 一覧中心か、中心オブジェクト中心か
- 密度
- セクションの順序
- Desktop / Mobileでの構造
- 情報開示の方法

採用する方向は、見栄えの派手さではなく、主要タスク、内容、利用環境、既存プロダクトとの整合性で選ぶ。

この工程の目的は案を大量生成することではなく、AIが最初の統計的デフォルトへ即座に収束することを防ぐことである。

## Content-Driven Composition

画面構成はテンプレートから逆算せず、実際に存在する内容と操作から決める。

- コンテンツが必要としていないセクションを、一般的なWebサイトに存在するという理由で追加しない
- 3つに分ける理由がない情報を、見栄えのために3カードへ分割しない
- Dashboardだからという理由だけで上部へ指標カードを並べない
- Landing pageだからという理由だけで `Hero → Feature cards → Testimonials → Pricing → FAQ → CTA` を採用しない
- 内部ツールやアプリへ、Marketing pageのようなHeroや宣伝コピーを持ち込まない
- 実データ、実コンテンツの長さと偏りを前提に構成する

## AI-Default Warning Signs

次はAI生成UIで頻出するため、**無意識のデフォルトとして採用していないか確認する警告項目**とする。個別に禁止はしない。プロダクト上の明確な理由があれば使用してよい。

- 中央揃えの大見出し + 抽象的サブコピー + 2つのCTA
- 同じ大きさの3カード / 4カードを並べる機械的なFeature grid
- 内容の関係を無視したBento grid
- ほぼすべてをカード化する構成
- ほぼすべての部品を大きな角丸にする
- pill型バッジ、pill型ボタン、eyebrow labelの多用
- 紫・青系グラデーション、aurora、glow、glassmorphismを「AI/Techらしさ」の代替として使う
- 見出しのgradient text
- 意味のないSparkles、Rocket、Shield、Zapなどの汎用アイコン
- すべてのカードがhoverで持ち上がる
- `transition-all` のような広すぎる動き
- 実在しない利用者数、導入企業数、評価、testimonial、性能値
- 「Seamless」「Powerful」「Supercharge」「Unlock」など内容を説明しないgenericな宣伝コピー
- 同じサイズ・同じ余白・同じ視覚重量が画面全体で反復される
- コンポーネントライブラリのデフォルト外観がそのまま残る
- Desktopを単純に1列へ積み直しただけのMobile

### Cluster Rule

警告項目が一つあるだけでAIらしいと断定しない。

しかし、同じ主要画面に複数の警告項目が理由なく集中し、さらにプロダクト固有の構造・内容・視覚言語が弱い場合は、色や角丸を微調整する前に構造から再検討する。

## Design System and Tokens

AIが画面ごとに別の判断を即興することを防ぐため、既存のデザインシステムまたは現在のコード内のtokensを優先する。

新規プロダクトで必要な場合は、少なくとも次を一貫させる。

- color roles
- typography roles
- spacing scale
- radius rules
- border / elevation rules
- icon style
- motion rules
- layout widths / breakpoints
- component density

ただし、token管理のためだけに新しいファイルや複雑な基盤を増やさない。既存CSS variables、theme、style設定など、現在の構成で最も単純な方法を使う。

任意値を大量に追加して見た目を合わせるより、少数の基準を再利用する。

## Design References

参考元を使う第一目的は、**主要画面を一目見たときのデザイン品質を上げ、汎用的なAI生成テンプレートに見える状態を避けること**とする。

機能、教材構造、プロダクト構成、フローから学ぶことも許容するが、それだけでデザイン参照を完了したことにしない。

### Lightweight First-Impression Pass

新規UIまたは主要画面の大きな変更では、実装前に次の範囲で短く参照調査する。

- ユーザーが参考元を指定した場合はそれを優先する。指定がなければ、今回の画面と比較する意味がある実在プロダクトをAI自身が1〜2件選ぶ。
- 競合だけに限定しない。近い情報密度、画面分割、作業環境を持つWebアプリ、IDE、開発ツール、教育サービスなども対象にする。
- 紹介文や機能一覧ではなく、実際の主要画面をブラウザで表示し、スクリーンショットとして視覚的に確認する。
- 同じ参考画面について、アクセス可能であればHTMLソース、ブラウザ上のDOM、Computed Styles、CSS variablesも確認する。スクリーンショット確認とHTML / CSS確認は代替関係ではなく、両方できる場合は両方行う。
- 原則として、各参考元につき今回の主要画面に近いDesktop画面1つを見ればよい。
- loading、empty、error、すべての操作状態、すべての画面幅を網羅的に調べる必要はない。
- HTMLやCSSは全体を解析しない。フォント、主要領域の比率、余白、背景、境界、角丸、影など、第一印象を左右する判断に必要な範囲だけ見る。
- ログイン、技術的制限、利用規約、取得不能などでスクリーンショットまたはHTML / CSSの一方を確認できない場合は、その事実を明記し、取得できた情報で作業を続ける。両方取得できるのに一方だけで参照調査を終えない。

生のHTMLソースは現代のWebアプリでは設計判断を読み取りにくい場合がある。HTMLを確認するときは、可能ならブラウザ上のDOM、Computed Styles、CSS variablesも併せて確認する。

参考元のHTML、CSS、画像、文章、アイコンをそのまま複製しない。観察した構図、階層、密度、文字、色、面の扱いを、このプロダクト固有の目的と内容へ翻訳する。

### What to Observe

第一印象に影響する次の項目へ絞って観察する。

- 画面全体のシルエットと重心
- 主要領域の配置と比率
- 情報密度と余白のリズム
- 文字の役割、サイズ、ウェイト、行間
- 背景、パネル、境界、角丸、影の使い分け
- アクセント色の位置と量
- 最初に視線が向く要素
- プロダクト固有に見える表現

「シンプル」「モダン」「見やすい」などの感想だけで終えず、実装判断へ変換できる具体性を持たせる。

### Required Reference Notes

実装前に、**Project Direction** へ次だけを簡潔に残す。

- 参考元の製品名と確認した画面のURL
- 実画面から観察した、第一印象を作る3〜5個の具体的な判断
- 今回採用する点
- 今回採用しない点
- 今回のレイアウト、文字、色、面へどう適用するか

機能や学習構造を参考にした内容は、UIデザイン上の観察と分けて記録する。

参考スクリーンショット、調査メモ、専用ディレクトリは、ユーザーが求めた場合または恒常的に残す価値がある場合だけ保存する。参照した事実を示すためだけにファイルを増やさない。

### Translation Before Implementation

参照後、実装前に次を決める。

- Visual direction: このプロダクト固有の第一印象
- Macrostructure: 主要領域の配置、比率、重心
- Typography: 見出し、本文、操作、コードなど主要な役割
- Color and surface: 背景、面、本文、補助文字、境界、アクセント
- Signature: 画面を見た人が覚える固有の視覚表現またはインタラクションを1つ

Signature以外は静かに整え、複数の派手な表現を競合させない。

### One-Pass Visual QA

初回実装後は、主要なDesktop画面を実際にレンダリングし、スクリーンショットで一度確認する。

次の点だけを優先する。

- 一目で何をする画面か分かるか
- 視線を向ける場所が明確か
- 画面全体の比率、文字、色、余白に一貫性があるか
- カード、角丸、グラデーション、装飾が理由なく集中していないか
- 参考元と比べて明らかに粗い印象がないか
- Logo Swap TestとScreenshot Silhouette Testで、汎用的なAIテンプレートに見えないか
- プロダクト固有の視覚判断が少なくとも1つ見えるか

第一印象への影響が大きい問題を最大3件に絞って一度修正し、主要画面を再確認する。

この参照・QA工程では、エラー状態、空状態、細かなインタラクション、全ブレークポイントの網羅を完了条件にしない。第一印象に重大な問題がなく、意図した視覚方向が画面に現れていれば終了する。

### Completion Gate

次を満たすまで「デザイン参照完了」または「デザイン完成」と報告しない。

- 実在する参考画面を1〜2件、実画面またはスクリーンショットで確認した
- 機能・学習構造ではなく、UIの視覚表現を具体的に観察した
- 採用する点、採用しない点、今回の適用方法を決めた
- Macrostructure、Typography、Color and surface、Signatureを決めた
- 実装後の主要Desktop画面をスクリーンショットで確認した
- 第一印象への影響が大きい問題を一度修正した

## Hierarchy Before Decoration

画面の完成度が低いと感じた場合、装飾を足す前に次の順で原因を確認する。

1. 情報構造
2. 主要タスクと主要アクション
3. 構成と画面の重心
4. 情報階層
5. レイアウトとalignment
6. 密度とspacing rhythm
7. typography
8. component choice
9. color / border / radius / shadow
10. decorative effects / motion

上位の問題を下位の装飾で隠さない。

## Human Craftsmanship Standard

プロダクトレベルのUIでは、少なくとも次を満たす。

### Intentionality

主要な構成、表現、操作について、なぜこのプロダクトに適しているか説明できる。

### Functional Completeness

インタラクティブに見える要素は実際に動く。動かない装飾ボタンや意味のない操作要素を置かない。

### Product Specificity

プロダクト固有の対象、データ、利用者、操作が画面構成へ反映される。

### Resilience

可能な範囲で、loading、empty、error、permission、disabled、長いテキスト、大きな数値、少量データ、大量データ、狭い画面など現実の状態でも崩れない。

### Evidence Over Claims

testimonial、利用者数、導入社数、性能、セキュリティ、効果などを見栄えのために創作しない。根拠がない場合は表示しない。

### Accessibility Is Not Decoration

コンポーネントがアクセシブルだから画面全体も自動的にアクセシブルだとは考えない。必要に応じてfocus、keyboard、touch target、contrast、accessible name、motion preferenceなど実際の利用方法を確認する。

## Responsive Design

MobileはDesktopの縮小版ではない。

- 画面幅が変わったとき、重要度の低い情報を単に下へ積み続けない
- 主要操作が画面外や長いスクロールの末尾へ追いやられないようにする
- touchとpointerの違いを考慮する
- hoverだけに情報や操作を依存させない
- Desktopの横並びがMobileで何の順序になるべきかを内容から決める
- 固定要素、overlay、keyboard表示時など実際のMobile利用で問題が出ないか考える

## Genericness Tests

主要画面について次を確認する。

### Logo Swap Test

> プロダクト名、ロゴ、アクセントカラーを変更しただけで、この画面を複数の無関係なサービスにもそのまま使えそうか。

Yesの場合、装飾を追加する前に、構成、情報階層、コンテンツ、操作、レイアウトにプロダクト固有性が不足していないか再検討する。

### Screenshot Silhouette Test

文字を細かく読まず、画面の大きな形、余白、強弱だけを見たとき、典型的なAI SaaSテンプレートと同じシルエットになっていないか確認する。

同じ場合は、色ではなくmacrostructureを疑う。

### Purpose Test

目立つ装飾、カード、グラデーション、バッジ、モーションについて、

> これがなくなると、情報理解・操作・状態・ブランド表現の何が悪化するか。

を答えられない場合は、削除または別表現を検討する。

## Final Review

ユーザー向けデザインの実装完了後は、可能なら実装時とは独立した新しいコンテキストで `DESIGN_REVIEW.md` に従って実画面をレビューする。

<!-- repository-creator:managed:end -->

# Jitter — Style Reference
> kinetic playground in a Swiss design studio — soft white surfaces, pill-shaped cards, and a violet spark firing on near-black ink.

**Theme:** light

Jitter reads as a kinetic playground rendered in Swiss-design precision. The canvas is a soft off-white (#f2f1f3) with bright white cards floating on it via diffuse, multi-layer shadows that bleed across more than 150px of vertical space. A near-black ink (#19171c) carries the majority of the UI — headlines, nav, buttons, body — with a deeply saturated violet (#7a40ed) acting as a brand spark for hero CTAs, tags, and feature highlights. Secondary punctuation comes from a vivid cyan-blue (#00b2ff) and an electric yellow-green (#f5ff63). Typography splits the work: TWK Lausanne (a custom geometric grotesque) takes the stage at 48–200px with aggressive negative tracking, while Inter handles everything 26px and below with quiet competence. The geometry is rounded to the point of pill-shaped — cards and buttons share 40–50px radii, so every surface feels like a soft cushion rather than a hard tile.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Studio Off-White | `#f2f1f3` | `--color-studio-off-white` | Page canvas and recessed section backgrounds — the base layer on which every card and panel sits |
| Pure White | `#ffffff` | `--color-pure-white` | Card surfaces, elevated panels, text on dark fills, button labels on filled buttons |
| Hairline Gray | `#e5e4e7` | `--color-hairline-gray` | Subtle borders, divider lines, and muted card backgrounds |
| Soft Mist | `#97979b` | `--color-soft-mist` | Muted secondary text and placeholder labels |
| Slate | `#6e6e73` | `--color-slate` | Body copy in card contexts, secondary descriptive text |
| Ink | `#19171c` | `--color-ink` | Supporting neutral for secondary UI, dividers, and muted labels. Do not promote it to the primary CTA color |
| Pure Black | `#000000` | `--color-pure-black` | Icon fills, footer text, maximum-contrast dark surfaces |
| Eclipse Violet | `#7a40ed` | `--color-eclipse-violet` | Violet supporting accent for decorative details and low-frequency emphasis. Do not promote it to the primary CTA color |
| Deep Plum | `#17082c` | `--color-deep-plum` | Dark violet, near-black with purple cast — headings on light surfaces where an extra brand warmth is needed |
| Lilac Wash | `#a981ff` | `--color-lilac-wash` | Violet supporting accent for decorative details and low-frequency emphasis. Do not promote it to the primary CTA color |
| Lavender Mist | `#cab3f8` | `--color-lavender-mist` | Pale violet — secondary link backgrounds and highlight washes |
| Electric Blue | `#00b2ff` | `--color-electric-blue` | Secondary accent — animated highlight rings, icon accents, card border highlights |
| Sky Tint | `#e6f4ff` | `--color-sky-tint` | Cool blue-tinted card backgrounds and soft highlight washes |
| Ice Blue | `#a9dbff` | `--color-ice-blue` | Mid-saturation blue — decorative fills inside illustration and animated graphics |
| Volt | `#f5ff63` | `--color-volt` | Green supporting accent for decorative details and low-frequency emphasis. Use as a supporting accent, not as a status color |

## Tokens — Typography

### TWK Lausanne

Display and heading typeface — handles everything from 16px subheads up to a 200px hero. The 750/800 weights carry the brand voice at large sizes; the condensed letter-spacing pulls characters tight so headlines feel engineered rather than set. Line-heights compress below 1.0 at display sizes (0.85–0.95), making the hero feel dense and architectural rather than airy. · `--font-twk-lausanne`

- **Substitute:** Inter Tight, Switzer, or General Sans
- **Weights:** 500, 600, 700, 750, 800
- **Sizes:** 16, 18, 20, 21, 24, 36, 40, 48, 72, 80, 200
- **Line height:** 0.85, 0.90, 0.95, 1.00, 1.20, 1.38, 1.50, 2.50
- **Letter spacing:** -0.044em at 200px display, -0.032em at 80px, -0.037em at 72px, -0.030em at 48px, -0.020em at 24px, -0.010em at 16px

### Inter

UI and body typeface — nav labels, button text, card descriptions, badge copy, form inputs, and the 26px sub-heading tier. Inter carries the weight of small-to-medium text across the entire interface while TWK Lausanne does the display work above 36px. Negative tracking is modest (-0.017 to -0.023em) and only applied at 15px and above. · `--font-inter`

- **Substitute:** Inter (already on Google Fonts)
- **Weights:** 400, 500, 600, 700, 800
- **Sizes:** 12, 13, 14, 15, 16, 17, 18, 26
- **Line height:** 1.10, 1.14, 1.15, 1.20, 1.25, 1.40, 1.41, 1.50, 1.60
- **Letter spacing:** -0.023em at 18px, -0.020em at 16–17px, -0.017em at 15px, 0 at 12–14px

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 12px | 1.5 | — | `--text-caption` |
| body-sm | 14px | 1.5 | — | `--text-body-sm` |
| body | 16px | 1.5 | — | `--text-body` |
| subheading | 21px | 1.38 | — | `--text-subheading` |
| heading-sm | 26px | 1.25 | — | `--text-heading-sm` |
| heading | 40px | 1.2 | — | `--text-heading` |
| heading-lg | 48px | 1.15 | — | `--text-heading-lg` |
| display | 80px | 0.95 | -2.56px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 44 | 44px | `--spacing-44` |
| 60 | 60px | `--spacing-60` |
| 68 | 68px | `--spacing-68` |
| 80 | 80px | `--spacing-80` |
| 84 | 84px | `--spacing-84` |
| 100 | 100px | `--spacing-100` |
| 144 | 144px | `--spacing-144` |
| 180 | 180px | `--spacing-180` |
| 200 | 200px | `--spacing-200` |

### Border Radius

| Element | Value |
|---------|-------|
| cards | 40px |
| badges | 40px |
| inputs | 26px |
| buttons | 50px |
| nav-elements | 20px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| xl | `rgba(25, 23, 28, 0.01) 0px 152px 61px 0px, rgba(25, 23, 2...` | `--shadow-xl` |
| xl-2 | `rgba(0, 0, 0, 0.01) 0px 63px 25px 0px, rgba(0, 0, 0, 0.05...` | `--shadow-xl-2` |
| subtle | `rgb(255, 255, 255) 1px 0px 0px 0px, rgb(255, 255, 255) -1...` | `--shadow-subtle` |
| xl-3 | `rgba(0, 0, 0, 0.01) 0px 119px 48px 0px, rgba(0, 0, 0, 0.0...` | `--shadow-xl-3` |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 80-120px
- **Card padding:** 24-40px
- **Element gap:** 8-12px

## Components

### Navigation Header
**Role:** Top-level site navigation

White background, 20px radius on grouped link containers, logo on the left in #19171c, nav links at 14–16px Inter weight 500 in #19171c, a ghost 'Log in' text link, and a dark filled CTA button on the right edge. Sticky on scroll. Height approximately 64px.

### Dark Filled Pill Button
**Role:** Primary navigation and high-emphasis action

50px border-radius (full pill), fill #19171c, text #ffffff at 14–16px Inter weight 500–600, horizontal padding 20–24px, vertical padding 10–12px. Used for the 'Try for free' nav CTA and 'Browse 300+ free templates' overlay button. The 50px radius forces a capsule shape regardless of label length.

### Violet Filled Pill Button
**Role:** Hero call-to-action and brand-forward action

50px border-radius, fill #7a40ed, text #ffffff at 16px Inter weight 600, padding 16px 32px. Larger scale than the dark button — sits alone in the hero as the singular brand-colored action on the page.

### Pill Badge / Tag
**Role:** Section label and category tag

40px border-radius, small padding 4–8px vertical, 12–16px horizontal. Background varies: lilac wash #cab3f8 for category tags, Volt #f5ff63 for attention/warning tags, lilac #a981ff for highlighted labels. Text at 12–14px Inter weight 500 in #17082c or #19171c. Always appears above a section heading as a kicker.

### Circular Menu Button
**Role:** Mobile/overlay menu toggle

Perfectly circular (375px radius equivalent), fill #19171c, white hamburger icon centered. Sits flush to the top-right of the header alongside the dark CTA.

### Animation Preview Card
**Role:** Animated content showcase tile

White #ffffff fill, 40px border-radius, padding 0 (edge-to-edge media). Rises off the canvas via the signature layered shadow: rgba(25,23,28,0.01) 0 152px 61px, rgba(25,23,28,0.05) 0 85px 51px, rgba(25,23,28,0.09) 0 38px 38px, rgba(25,23,28,0.10) 0 9px 21px. The shadow extends 150px+ vertically — cards feel like they hover far above the page.

### Logo Cloud Strip
**Role:** Social proof band of partner/customer logos

Sits on the page canvas (#f2f1f3), one-line intro text centered above in 14px Inter weight 500 #6e6e73. Logos in #19171c at roughly 20–24px height, evenly spaced with 40–60px gap. No dividers between logos — the row is one continuous line of trust signals.

### Hero Section
**Role:** Above-the-fold introduction

Centered layout on the off-white canvas. A small pill badge at the top, an 80px TWK Lausanne headline below in #19171c, a single violet CTA centered beneath, then the logo cloud. No hero image — the visual weight comes from the large display type alone.

### Two-Column Feature Section
**Role:** Text + media content blocks

Asymmetric split: left column holds a 40–48px TWK Lausanne heading and Inter body copy, right column holds an Animation Preview Card. On alternate sections the order flips. Gap between columns approximately 40–64px, section padding 80–120px vertical.

### Template Card Grid
**Role:** Browseable template gallery

Horizontal-scrolling row of Animation Preview Cards, 4–5 visible at once on desktop. Each card is 40px radius with the same hover-shadow elevation. Overlay dark pill button ('Browse 300+ free templates') floats above the row as a forward action.

### Inline Text Link
**Role:** Standalone text link with brand color

14–16px Inter weight 500 in #7a40ed, no underline by default, underline appears on hover. Used for 'Learn more' inline CTAs and footer links.

### Dark Input Field
**Role:** Text input on dark surface

26px border-radius, fill #2d2933, text #ffffff at 14–16px Inter weight 400, padding 12–16px. Placeholder text in a muted desaturated tone of the dark surface.

### Hamburger Overlay Panel
**Role:** Mobile/expanded navigation menu

Full-viewport overlay in #ffffff with 40px outer padding, list of nav items at 24–32px TWK Lausanne weight 600 in #19171c, stacked vertically with 16–24px gap. Closes via a circular dark button in the top-right corner.

## Do's and Don'ts

### Do
- Use #7a40ed for the singular hero CTA on a page — it should appear alone, not repeated across multiple action surfaces.
- Set border-radius to 50px on all buttons and 40px on all cards, badges, and preview tiles — the capsule/pillow geometry is the signature.
- Use TWK Lausanne (or Inter Tight as substitute) at 80px weight 750+ for hero display with letter-spacing -0.032em and line-height 0.95.
- Use the four-layer diffused shadow stack on all elevated cards — the 150px+ vertical spread is what makes elements feel like they float.
- Keep body and UI copy in Inter at 14–18px weight 400–500 in #19171c, reserving #6e6e73 for secondary descriptive text.
- Apply the lilac pill badge (#cab3f8) above section headings as a category kicker — one badge per section, never stacked.
- Limit accent color usage: one violet CTA per view, optional cyan-blue (#00b2ff) and Volt (#f5ff63) reserved for tag/status contexts only.

### Don't
- Do not use sharp corners or radii below 20px anywhere — the rounded geometry is non-negotiable.
- Do not place the violet CTA (#7a40ed) in the navigation bar; nav-level CTAs should be the dark #19171c fill.
- Do not use raw #000000 for body text or button fills — always use #19171c to keep the brand-violet undertone alive.
- Do not apply shadows with hard edges or single-layer low-blur values; the multi-layer diffuse stack at low opacity is the system.
- Do not use the Volt yellow (#f5ff63) on a dark background without confirming it has a dark text label — the contrast is so extreme it functions as a warning.
- Do not set display type above 26px in Inter — Inter is for UI, TWK Lausanne owns everything 36px and up.
- Do not introduce a fourth chromatic accent beyond violet, blue, and Volt — the system runs on chromatic scarcity.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Studio Off-White | `#f2f1f3` | Page canvas — the base layer everything else sits on |
| 1 | Pure White | `#ffffff` | Card surfaces and animation preview tiles |
| 2 | Hairline Gray | `#e5e4e7` | Muted recessed panels and subtle background shifts |
| 3 | Ink | `#19171c` | Dark surface — filled buttons, header on dark mode, high-contrast blocks |

## Elevation

- **Animation Preview Card (hovered):** `0px 152px 61px 0px rgba(25,23,28,0.01), 0px 85px 51px 0px rgba(25,23,28,0.05), 0px 38px 38px 0px rgba(25,23,28,0.09), 0px 9px 21px 0px rgba(25,23,28,0.10)`
- **Template Card (resting):** `0px 119px 48px 0px rgba(0,0,0,0.01), 0px 67px 40px 0px rgba(0,0,0,0.05), 0px 30px 30px 0px rgba(0,0,0,0.09), 0px 7px 16px 0px rgba(0,0,0,0.10)`
- **Floating overlay element:** `0px 63px 25px 0px rgba(0,0,0,0.01), 0px 35px 21px 0px rgba(0,0,0,0.05), 0px 16px 16px 0px rgba(0,0,0,0.09), 0px 4px 9px 0px rgba(0,0,0,0.10)`

## Imagery

Visuals are dominated by product-generated animation previews — short looping motion clips rendered as rounded-corner video tiles. No lifestyle photography, no human subjects, no environment shots. The motion previews are the imagery: abstract geometric loops, type animations, icon morphs, and UI mockups in motion. All sit on pure white with 40px radius. Supporting graphics include flat duotone illustrations in violet-to-plum gradient (#7a40ed → #17082c) and lilac-to-lavender gradient (#a981ff → #cab3f8) used for section backgrounds. No raster photography appears anywhere.

## Layout

Max-width 1200px centered, generous 80–120px vertical breathing room between sections. The page is a vertical stack of horizontal bands on the #f2f1f3 canvas. Each band is either: (1) a centered hero stack (badge → headline → CTA → logo cloud), (2) a two-column asymmetric block (text-left/media-right alternating), or (3) a horizontal-scrolling card row of animation previews. No sidebar, no persistent navigation rail — navigation is a single sticky top bar. The hero is typographic (no hero image); the visual interest escalates as the user scrolls into the animation preview cards. Sections flow seamlessly without dividers, separated only by whitespace.

## Agent Prompt Guide

## Quick Color Reference
- text: #19171c
- background: #f2f1f3
- card surface: #ffffff
- border: #e5e4e7
- accent: #7a40ed
- primary action: no distinct CTA color

## Example Component Prompts
No distinct primary action color was observed; use the extracted neutral button treatments instead of inventing a filled CTA color.

2. **Animation preview card**: Pure white #ffffff fill, 40px border-radius, edge-to-edge video content. Hovered state applies the four-layer shadow: rgba(25,23,28,0.01) 0 152px 61px, rgba(25,23,28,0.05) 0 85px 51px, rgba(25,23,28,0.09) 0 38px 38px, rgba(25,23,28,0.10) 0 9px 21px. No visible border.

4. **Template card grid row**: Five Animation Preview Cards in a horizontal row with 20px gap, each 40px radius on the #f2f1f3 canvas. A dark filled pill button ('Browse 300+ free templates', #19171c fill, white text, 50px radius) floats centered over the row.

5. **Pill badge above section heading**: Background #a981ff, text #17082c, 12px Inter weight 600, 40px border-radius, padding 4px 14px. Sits 8–12px above a 40–48px TWK Lausanne heading in #19171c.

## Similar Brands

- **Figma** — Same white-canvas design-tool aesthetic with pill buttons, soft rounded cards, and tight geometric typography at display sizes
- **Framer** — Identical playfulness: off-white canvas, violet brand accent, oversized display headlines with aggressive negative tracking, and a focus on motion as the primary content
- **Linear** — Same near-black ink (#19171c variant) for primary surfaces, pill-shaped controls, and a strict approach to accent color as functional punctuation rather than decoration
- **Pitch** — Similar Swiss-design type treatment, generous vertical section gaps, and a violet-forward brand palette on a light canvas
- **Spline** — Same product-showcase-first approach where motion previews replace photography, on rounded white cards floating over soft off-white

## Quick Start

### CSS Custom Properties

```css
:root {
  --color-studio-off-white: #f2f1f3;
  --color-pure-white: #ffffff;
  --color-hairline-gray: #e5e4e7;
  --color-soft-mist: #97979b;
  --color-slate: #6e6e73;
  --color-ink: #19171c;
  --color-pure-black: #000000;
  --color-eclipse-violet: #7a40ed;
  --color-deep-plum: #17082c;
  --color-lilac-wash: #a981ff;
  --color-lavender-mist: #cab3f8;
  --color-electric-blue: #00b2ff;
  --color-sky-tint: #e6f4ff;
  --color-ice-blue: #a9dbff;
  --color-volt: #f5ff63;
  --font-twk-lausanne: 'TWK Lausanne', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-inter: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --text-caption: 12px;
  --leading-caption: 1.5;
  --text-body-sm: 14px;
  --leading-body-sm: 1.5;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-subheading: 21px;
  --leading-subheading: 1.38;
  --text-heading-sm: 26px;
  --leading-heading-sm: 1.25;
  --text-heading: 40px;
  --leading-heading: 1.2;
  --text-heading-lg: 48px;
  --leading-heading-lg: 1.15;
  --text-display: 80px;
  --leading-display: 0.95;
  --tracking-display: -2.56px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-w750: 750;
  --font-weight-extrabold: 800;
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-44: 44px;
  --spacing-60: 60px;
  --spacing-68: 68px;
  --spacing-80: 80px;
  --spacing-84: 84px;
  --spacing-100: 100px;
  --spacing-144: 144px;
  --spacing-180: 180px;
  --spacing-200: 200px;
  --page-max-width: 1200px;
  --section-gap: 80-120px;
  --card-padding: 24-40px;
  --element-gap: 8-12px;
  --radius-2xl: 20px;
  --radius-3xl: 26px;
  --radius-3xl-2: 40px;
  --radius-full: 50px;
  --radius-full-2: 375px;
  --radius-cards: 40px;
  --radius-badges: 40px;
  --radius-inputs: 26px;
  --radius-buttons: 50px;
  --radius-nav-elements: 20px;
  --shadow-xl: rgba(25, 23, 28, 0.01) 0px 152px 61px 0px, rgba(25, 23, 28, 0.05) 0px 85px 51px 0px, rgba(25, 23, 28, 0.09) 0px 38px 38px 0px, rgba(25, 23, 28, 0.1) 0px 9px 21px 0px;
  --shadow-xl-2: rgba(0, 0, 0, 0.01) 0px 63px 25px 0px, rgba(0, 0, 0, 0.05) 0px 35px 21px 0px, rgba(0, 0, 0, 0.09) 0px 16px 16px 0px, rgba(0, 0, 0, 0.1) 0px 4px 9px 0px;
  --shadow-subtle: rgb(255, 255, 255) 1px 0px 0px 0px, rgb(255, 255, 255) -1px 0px 0px 0px;
  --shadow-xl-3: rgba(0, 0, 0, 0.01) 0px 119px 48px 0px, rgba(0, 0, 0, 0.05) 0px 67px 40px 0px, rgba(0, 0, 0, 0.09) 0px 30px 30px 0px, rgba(0, 0, 0, 0.1) 0px 7px 16px 0px;
  --surface-studio-off-white: #f2f1f3;
  --surface-pure-white: #ffffff;
  --surface-hairline-gray: #e5e4e7;
  --surface-ink: #19171c;
}
```

### Tailwind v4

```css
@theme {
  --color-studio-off-white: #f2f1f3;
  --color-pure-white: #ffffff;
  --color-hairline-gray: #e5e4e7;
  --color-soft-mist: #97979b;
  --color-slate: #6e6e73;
  --color-ink: #19171c;
  --color-pure-black: #000000;
  --color-eclipse-violet: #7a40ed;
  --color-deep-plum: #17082c;
  --color-lilac-wash: #a981ff;
  --color-lavender-mist: #cab3f8;
  --color-electric-blue: #00b2ff;
  --color-sky-tint: #e6f4ff;
  --color-ice-blue: #a9dbff;
  --color-volt: #f5ff63;
  --font-twk-lausanne: 'TWK Lausanne', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-inter: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --text-caption: 12px;
  --leading-caption: 1.5;
  --text-body-sm: 14px;
  --leading-body-sm: 1.5;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-subheading: 21px;
  --leading-subheading: 1.38;
  --text-heading-sm: 26px;
  --leading-heading-sm: 1.25;
  --text-heading: 40px;
  --leading-heading: 1.2;
  --text-heading-lg: 48px;
  --leading-heading-lg: 1.15;
  --text-display: 80px;
  --leading-display: 0.95;
  --tracking-display: -2.56px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-44: 44px;
  --spacing-60: 60px;
  --spacing-68: 68px;
  --spacing-80: 80px;
  --spacing-84: 84px;
  --spacing-100: 100px;
  --spacing-144: 144px;
  --spacing-180: 180px;
  --spacing-200: 200px;
  --radius-2xl: 20px;
  --radius-3xl: 26px;
  --radius-3xl-2: 40px;
  --radius-full: 50px;
  --radius-full-2: 375px;
  --shadow-xl: rgba(25, 23, 28, 0.01) 0px 152px 61px 0px, rgba(25, 23, 28, 0.05) 0px 85px 51px 0px, rgba(25, 23, 28, 0.09) 0px 38px 38px 0px, rgba(25, 23, 28, 0.1) 0px 9px 21px 0px;
  --shadow-xl-2: rgba(0, 0, 0, 0.01) 0px 63px 25px 0px, rgba(0, 0, 0, 0.05) 0px 35px 21px 0px, rgba(0, 0, 0, 0.09) 0px 16px 16px 0px, rgba(0, 0, 0, 0.1) 0px 4px 9px 0px;
  --shadow-subtle: rgb(255, 255, 255) 1px 0px 0px 0px, rgb(255, 255, 255) -1px 0px 0px 0px;
  --shadow-xl-3: rgba(0, 0, 0, 0.01) 0px 119px 48px 0px, rgba(0, 0, 0, 0.05) 0px 67px 40px 0px, rgba(0, 0, 0, 0.09) 0px 30px 30px 0px, rgba(0, 0, 0, 0.1) 0px 7px 16px 0px;
}
```

## Project Direction — 適用メモ

2026-09-08のユーザー指定により、従来のSuperhuman方針をJitter仕様へ置き換える。v6で公開アプリのUIへ適用。

- 上記はユーザー提供のスタイル参照。外部サイトを観察した結果として扱わない。
- 原文にはCTAの扱いに差異がある。実装時はComponentsとDo/Don'tの具体的な用途を基準に、通常操作・ナビゲーションはInk、ヒーローが必要な場合のみ単独のViolet CTAとする。Voltは装飾・注目タグに限定し、成功・失敗の状態色には割り当てない。
- YOLOアプリの実映像は解析対象データなので、Imageryの装飾写真禁止を理由に削除・加工しない。検出の四角・輪郭・骨格も解析表現であり、UIコンテナの角丸ルールとは区別する。
- レイアウトは映像選択・解析モード・結果を中心にする。参考元の宣伝ヒーローや顧客ロゴは、実際の内容と必要性がある場合だけ使用する。
- CSS例の `80-120px` などは設計上の範囲表記。実装時には画面幅に応じた単一値またはclamp()へ変換する。

### v6 implementation

- 白い40px角丸の映像カードと4層の拡散影。操作は50pxのピル、選択フィールドは26px。
- 背景はStudio Off-White、本文はInk。選択モード・再生はInk、開始ボタンだけViolet。解析対象は紫・青・Volt・白で区別し、成功／失敗色には用いない。
- 見出し・結果数値はInter Tight 750、UIはInter。Google Fontsはdisplay=swap、取得不能時は端末書体へフォールバック。日本語見出しは読みやすい行高を維持。
- 映像を中心とする現行操作構造を維持。スマホは選択欄のラベルを上へ、シークを独立行へ配置。reduce-motion時はボタンの動きを停止。
- 完成後のコード再評価では、狭い幅の見出し折り返し、読みやすい検出ラベル、既存追跡の保持を確認。追加採用なし。
- 起動・切替・再試行・追跡の回帰検証を実施。Sitesスキルに従い、未依頼のブラウザ／画面QAは実施していない。
