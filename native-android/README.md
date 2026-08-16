# HAND//FX Native Zero-Lag Lab

Native Android rewrite of the HAND//FX browser prototype.

- CameraX preview independent from tracking/rendering.
- ImageAnalysis uses KEEP_ONLY_LATEST.
- MediaPipe Hand Landmarker uses LIVE_STREAM / detectAsync.
- MediaPipe result callback pushes snapshots directly to the GL renderer; no 33 ms UI polling hop.
- Continuous OpenGL ES 3 overlay predicts landmarks to render time, capped at 38 ms.
- Front-camera mirror handled in the renderer.
- Face tracking intentionally absent.

Current latency-lab visuals: V5.3-style fingertip polygon and double-clap orange spell-only sigil. Rich shader composer comes after real-device latency validation.
