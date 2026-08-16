package com.handfx.nativefx

import android.content.Context
import android.graphics.Bitmap
import android.os.SystemClock
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.ImageProcessingOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import java.util.concurrent.atomic.AtomicReference

class HandTracker(
    context: Context,
    private val onStatus: (String) -> Unit,
    private val onSnapshot: (TrackingSnapshot) -> Unit,
) : AutoCloseable {

    val snapshot = AtomicReference(TrackingSnapshot.EMPTY)
    private val clapDetector = ClapDetector()
    private var previous: List<List<Vec3>> = emptyList()
    private var previousCaptureMs = 0L

    private val landmarker: HandLandmarker

    init {
        val base = BaseOptions.builder()
            .setModelAssetPath("hand_landmarker.task")
            .setDelegate(Delegate.GPU)
            .build()
        val options = HandLandmarker.HandLandmarkerOptions.builder()
            .setBaseOptions(base)
            .setRunningMode(RunningMode.LIVE_STREAM)
            .setNumHands(2)
            .setMinHandDetectionConfidence(0.46f)
            .setMinHandPresenceConfidence(0.46f)
            .setMinTrackingConfidence(0.46f)
            .setResultListener(::onResult)
            .setErrorListener { e -> onStatus("MediaPipe: ${e.message}") }
            .build()
        landmarker = try {
            HandLandmarker.createFromOptions(context, options)
        } catch (gpuError: RuntimeException) {
            onStatus("GPU delegate gagal, fallback CPU")
            val cpuBase = BaseOptions.builder()
                .setModelAssetPath("hand_landmarker.task")
                .setDelegate(Delegate.CPU)
                .build()
            val cpuOptions = HandLandmarker.HandLandmarkerOptions.builder()
                .setBaseOptions(cpuBase)
                .setRunningMode(RunningMode.LIVE_STREAM)
                .setNumHands(2)
                .setMinHandDetectionConfidence(0.46f)
                .setMinHandPresenceConfidence(0.46f)
                .setMinTrackingConfidence(0.46f)
                .setResultListener(::onResult)
                .setErrorListener { e -> onStatus("MediaPipe: ${e.message}") }
                .build()
            HandLandmarker.createFromOptions(context, cpuOptions)
        }
    }

    fun analyze(imageProxy: ImageProxy) {
        val captureMs = SystemClock.uptimeMillis()
        val bitmap = Bitmap.createBitmap(imageProxy.width, imageProxy.height, Bitmap.Config.ARGB_8888)
        imageProxy.use { proxy ->
            proxy.planes[0].buffer.rewind()
            bitmap.copyPixelsFromBuffer(proxy.planes[0].buffer)
            val mpImage = BitmapImageBuilder(bitmap).build()
            val processing = ImageProcessingOptions.builder()
                .setRotationDegrees(proxy.imageInfo.rotationDegrees)
                .build()
            landmarker.detectAsync(mpImage, processing, captureMs)
        }
    }

    private fun onResult(result: HandLandmarkerResult, @Suppress("UNUSED_PARAMETER") input: com.google.mediapipe.framework.image.MPImage) {
        val now = SystemClock.uptimeMillis()
        val current = result.landmarks().map { hand ->
            hand.map { lm -> Vec3(lm.x(), lm.y(), lm.z()) }
        }
        val dtSec = ((result.timestampMs() - previousCaptureMs).coerceAtLeast(1L)) / 1000f
        val hands = current.mapIndexed { handIndex, pts ->
            val old = previous.getOrNull(handIndex)
            val velocity = pts.mapIndexed { i, p ->
                val q = old?.getOrNull(i)
                if (q == null || previousCaptureMs == 0L) Vec3(0f,0f,0f)
                else Vec3(
                    ((p.x-q.x)/dtSec).coerceIn(-9f,9f),
                    ((p.y-q.y)/dtSec).coerceIn(-9f,9f),
                    ((p.z-q.z)/dtSec).coerceIn(-9f,9f),
                )
            }
            TrackedHand(pts, velocity, HandMath.openFingerIds(pts))
        }

        when (val event = clapDetector.update(current, result.timestampMs())) {
            ClapDetector.Event.FirstClap -> onStatus("CLAP 1/2")
            is ClapDetector.Event.ModeChanged -> onStatus(if (event.enabled) "SPELL MODE ON" else "NORMAL MODE")
            null -> Unit
        }

        previous = current
        previousCaptureMs = result.timestampMs()
        val next = TrackingSnapshot(
            hands = hands,
            captureTimeMs = result.timestampMs(),
            inferenceMs = (now - result.timestampMs()).coerceAtLeast(0L),
            spellMode = clapDetector.currentMode(),
        )
        snapshot.set(next)
        onSnapshot(next)
    }

    override fun close() = landmarker.close()
}
