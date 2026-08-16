package com.handfx.nativefx

import kotlin.math.hypot

class ClapDetector {
    private enum class Phase { OPEN, CONTACT, WAIT_SEPARATE }

    private var phase = Phase.OPEN
    private var clapCount = 0
    private var lastClapMs = 0L
    private var contactSince = 0L
    private var spellMode = false

    fun currentMode(): Boolean = spellMode

    fun update(hands: List<List<Vec3>>, nowMs: Long): Event? {
        if (hands.size < 2) {
            if (clapCount > 0 && nowMs - lastClapMs > 2200) clapCount = 0
            return null
        }

        val a = palm(hands[0])
        val b = palm(hands[1])
        val scale = ((handWidth(hands[0]) + handWidth(hands[1])) * 0.5f).coerceAtLeast(0.04f)
        val norm = hypot(a.x - b.x, a.y - b.y) / scale

        when (phase) {
            Phase.OPEN -> if (norm < 1.35f) {
                phase = Phase.CONTACT
                contactSince = nowMs
            }
            Phase.CONTACT -> {
                if (norm < 1.55f && nowMs - contactSince >= 20L) phase = Phase.WAIT_SEPARATE
                else if (norm > 2.35f) phase = Phase.OPEN
            }
            Phase.WAIT_SEPARATE -> if (norm > 1.82f) {
                phase = Phase.OPEN
                if (nowMs - lastClapMs > 2200) clapCount = 0
                clapCount++
                lastClapMs = nowMs
                if (clapCount >= 2) {
                    clapCount = 0
                    spellMode = !spellMode
                    return Event.ModeChanged(spellMode)
                }
                return Event.FirstClap
            }
        }
        return null
    }

    private fun palm(h: List<Vec3>): Vec3 {
        val ids = intArrayOf(0, 5, 9, 13, 17)
        var x = 0f; var y = 0f; var z = 0f
        ids.forEach { i -> x += h[i].x; y += h[i].y; z += h[i].z }
        return Vec3(x / ids.size, y / ids.size, z / ids.size)
    }

    private fun handWidth(h: List<Vec3>): Float = hypot(h[17].x - h[5].x, h[17].y - h[5].y)

    sealed interface Event {
        data object FirstClap : Event
        data class ModeChanged(val enabled: Boolean) : Event
    }
}
