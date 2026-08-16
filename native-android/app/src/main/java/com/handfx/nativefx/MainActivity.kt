package com.handfx.nativefx

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.handfx.nativefx.databinding.ActivityMainBinding
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var tracker: HandTracker
    private val cameraExecutor = Executors.newSingleThreadExecutor()

    private val permission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        if (ok) startCamera() else binding.status.text = "Camera permission ditolak"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.preview.implementationMode = PreviewView.ImplementationMode.COMPATIBLE

        tracker = HandTracker(
            context = this,
            onStatus = { msg -> runOnUiThread { binding.status.text = msg } },
            onSnapshot = { snapshot -> binding.fxView.submit(snapshot) },
        )

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else permission.launch(Manifest.permission.CAMERA)

        binding.fxView.post(object : Runnable {
            override fun run() {
                val s = tracker.snapshot.get()
                if (s.captureTimeMs == 0L) {
                    binding.status.text = "Waiting for hand tracker…"
                } else if (!binding.status.text.startsWith("CLAP")) {
                    binding.status.text = "${if (s.spellMode) "SPELL" else "NORMAL"} · inference ${s.inferenceMs}ms · direct-to-renderer"
                }
                binding.fxView.postDelayed(this, 250L)
            }
        })
    }

    private fun startCamera() {
        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            val provider = providerFuture.get()
            val preview = Preview.Builder()
                .build()
                .also { it.setSurfaceProvider(binding.preview.surfaceProvider) }

            val analysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()
                .also { ia ->
                    ia.setAnalyzer(cameraExecutor) { image -> tracker.analyze(image) }
                }

            provider.unbindAll()
            provider.bindToLifecycle(
                this,
                CameraSelector.DEFAULT_FRONT_CAMERA,
                preview,
                analysis,
            )
            binding.status.text = "CameraX latest-frame-only · front camera"
        }, ContextCompat.getMainExecutor(this))
    }

    override fun onResume() {
        super.onResume()
        if (::binding.isInitialized) binding.fxView.onResume()
    }

    override fun onPause() {
        if (::binding.isInitialized) binding.fxView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        tracker.close()
        cameraExecutor.shutdown()
        super.onDestroy()
    }
}
