# PARK SCOPE / Kyoto aerial parking lab

## Outcome and scope
A browser-based trial of real YOLO11n-OBB vehicle detection on Kyoto aerial images. The user selects an image, optionally draws a parking polygon, runs YOLO, checks boxes and saves counts locally. Created via gakkii415/repository-creator (request PR #5). Public Pages target: https://gakkii415.github.io/kyoto-parking-yolo/.

Default inputs are GSI aerial photographs, **not live satellite imagery**. Acquisition dates are unverified and shown as unknown. Download/build times must never be represented as capture times. There is no scheduled image provider, invented time series or automatic satellite monitoring. Input images are not sent to an inference service. Same-geometry high-resolution satellite/aerial inputs can be supplied manually.

## Implementation
- Official Ultralytics YOLO11n-OBB weights from the v8.3.0 asset release, exported at 640×640 / opset17 by Ultralytics8.3.203.
- ONNX Runtime Web1.20.1, single WASM thread in a dedicated worker (no COOP/COEP dependence).
- 384px image tiles with 25% overlap, letterbox and RGB CHW normalization. Decode the actual [1,20,8400] tensor; retain globally winning small/large-vehicle classes; suppress duplicates using rotated-box IoU.
- Initial previews are genuine CPU ONNX results from the same weights, visibly distinguished from browser results. Interpolation and NMS implementations can produce slightly different preview/browser counts; these are not human-verified accuracy measurements.
- A vehicle is counted when its center lies inside the user's polygon and its score passes the threshold, excluding user-dismissed candidates. A static frame cannot prove a car is parked. No capacity/occupancy estimation.
- Metadata-only history in localStorage, maximum100 images. Duplicate SHA256 image saves update a record. CSV includes threshold, polygon, source, inference provenance and image hash. Original photos are not saved in history.
- Inputs capped at25MB and64million pixels, reduced to1536px maximum side to bound mobile runtime/memory.

## UI decisions
Compared a map-first full-screen inspector with a metric-dashboard approach. Chose the image inspector: the main user task is checking whether boxes correspond to visible cars, not studying unsupported metrics. Desktop puts controls beside the image; mobile condenses them above it and keeps the run action reachable. Lime indicates detection/actions, amber indicates counting area and historical-data caveats. Source credit stays on the image. A separate history tab prevents long scrolling through unrelated sections. No hover-only controls.

## Data and licenses
GSI tile source: https://maps.gsi.go.jp/development/ichiran.html
GSI credit guidance: https://www.gsi.go.jp/LAW/2930-meizi.html
Tiles are cropped/combined. Visible credit reads 国土地理院（画像を加工）. Tile URLs, locations and image hashes accompany the manifest.
YOLO11n-OBB documentation: https://docs.ultralytics.com/tasks/obb/
The app and YOLO model are distributed under AGPL-3.0. The complete license is packaged in the published site as LICENSE-AGPL-3.0.txt. The original Ultralytics copyright/license is retained there. ONNX Runtime uses MIT and its license is packaged at vendor/ONNX-RUNTIME-LICENSE.txt. Images are subject to GSI terms, not relicensed as AGPL.

## Validation and deferred features
Geometry unit tests plus a real (not mocked) ONNX browser integration run. Test artifacts include screenshots and JSON evidence. No mobile hardware performance or Kyoto-specific detection accuracy guarantee is claimed.

Deferred: a contracted recurring satellite feed, automated alignment across different viewpoints, model training on Kyoto labels, an observation database shared between devices, and live-camera ingest. These require data/infrastructure beyond this free static trial; fake versions must not be substituted.
