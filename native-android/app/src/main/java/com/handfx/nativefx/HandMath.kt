package com.handfx.nativefx

import kotlin.math.*

object HandMath {
    private val fingerChains = arrayOf(
        intArrayOf(1, 2, 3, 4),
        intArrayOf(5, 6, 7, 8),
        intArrayOf(9, 10, 11, 12),
        intArrayOf(13, 14, 15, 16),
        intArrayOf(17, 18, 19, 20),
    )
    private val tipIds = intArrayOf(4, 8, 12, 16, 20)

    fun openFingerIds(h: List<Vec3>): IntArray {
        val palm = avg(h, intArrayOf(0, 5, 9, 13, 17))
        val out = ArrayList<Int>(5)
        fingerChains.forEachIndexed { index, c ->
            val a = h[c[0]]; val b = h[c[1]]; val d = h[c[2]]; val t = h[c[3]]
            val bend = min(angle(a, b, d), angle(b, d, t))
            val straight = clamp01((bend - 105f) / 60f)
            val score = if (index == 0) {
                val radial = dist(t, palm) / dist(b, palm).coerceAtLeast(1e-5f)
                val spread = dist(t, h[5]) / dist(h[2], h[5]).coerceAtLeast(1e-5f)
                0.46f * straight + 0.32f * clamp01((radial - 0.82f) / 0.58f) + 0.22f * clamp01((spread - 0.70f) / 0.68f)
            } else {
                val radial = dist(t, palm) / dist(b, palm).coerceAtLeast(1e-5f)
                val distal = dist(t, palm) / dist(d, palm).coerceAtLeast(1e-5f)
                0.52f * straight + 0.31f * clamp01((radial - 0.98f) / 0.50f) + 0.17f * clamp01((distal - 0.94f) / 0.30f)
            }
            if (score >= 0.40f) out += tipIds[index]
        }
        return out.toIntArray()
    }

    private fun avg(h: List<Vec3>, ids: IntArray): Vec3 {
        var x = 0f; var y = 0f; var z = 0f
        ids.forEach { i -> x += h[i].x; y += h[i].y; z += h[i].z }
        return Vec3(x / ids.size, y / ids.size, z / ids.size)
    }

    private fun dist(a: Vec3, b: Vec3): Float = sqrt((a.x-b.x).pow(2) + (a.y-b.y).pow(2) + (a.z-b.z).pow(2))
    private fun angle(a: Vec3, b: Vec3, c: Vec3): Float {
        val bax = a.x-b.x; val bay = a.y-b.y; val baz = a.z-b.z
        val bcx = c.x-b.x; val bcy = c.y-b.y; val bcz = c.z-b.z
        val den = sqrt((bax*bax+bay*bay+baz*baz)*(bcx*bcx+bcy*bcy+bcz*bcz)).coerceAtLeast(1e-6f)
        val q = ((bax*bcx+bay*bcy+baz*bcz)/den).coerceIn(-1f,1f)
        return Math.toDegrees(acos(q).toDouble()).toFloat()
    }
    private fun clamp01(v: Float) = v.coerceIn(0f,1f)
}
