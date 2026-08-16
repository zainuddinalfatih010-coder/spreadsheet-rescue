package com.handfx.nativefx

data class Vec3(val x: Float, val y: Float, val z: Float = 0f)

data class TrackedHand(
    val points: List<Vec3>,
    val velocity: List<Vec3>,
    val openFingerIds: IntArray,
)

data class TrackingSnapshot(
    val hands: List<TrackedHand>,
    val captureTimeMs: Long,
    val inferenceMs: Long,
    val spellMode: Boolean,
) {
    companion object {
        val EMPTY = TrackingSnapshot(emptyList(), 0L, 0L, false)
    }
}
