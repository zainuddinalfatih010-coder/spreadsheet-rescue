package com.handfx.nativefx

import android.content.Context
import android.graphics.PixelFormat
import android.opengl.GLES30
import android.opengl.GLSurfaceView
import android.os.SystemClock
import android.util.AttributeSet
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.util.concurrent.atomic.AtomicReference
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.*

class HandFxGLView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : GLSurfaceView(context, attrs) {
    private val data = AtomicReference(TrackingSnapshot.EMPTY)
    private val rendererImpl = FxRenderer(data)

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8,8,8,8,16,0)
        holder.setFormat(PixelFormat.TRANSLUCENT)
        setZOrderOnTop(true)
        preserveEGLContextOnPause = true
        setRenderer(rendererImpl)
        renderMode = RENDERMODE_CONTINUOUSLY
    }

    fun submit(snapshot: TrackingSnapshot) = data.set(snapshot)

    private class FxRenderer(private val state: AtomicReference<TrackingSnapshot>) : Renderer {
        private var program = 0
        private var aPos = 0
        private var uColor = 0
        private val verts = FloatArray(4096)

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            GLES30.glClearColor(0f,0f,0f,0f)
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE)
            program = makeProgram(VS, FS)
            aPos = GLES30.glGetAttribLocation(program, "aPos")
            uColor = GLES30.glGetUniformLocation(program, "uColor")
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glViewport(0,0,w,h)
        }

        override fun onDrawFrame(gl: GL10?) {
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            val s = state.get()
            if (s.hands.isEmpty()) return
            if (s.spellMode) drawSpell(s) else drawNormal(s)
        }

        private fun predict(hand: TrackedHand, nowMs: Long, captureMs: Long): List<Vec3> {
            val dt = ((nowMs - captureMs).coerceIn(0L, 38L)) / 1000f
            return hand.points.mapIndexed { i, p ->
                val v = hand.velocity[i]
                val speed = hypot(v.x, v.y)
                val gain = when {
                    speed > 5f -> 0.90f
                    speed > 2f -> 0.72f
                    else -> 0.48f
                }
                Vec3(
                    (p.x + v.x*dt*gain).coerceIn(-0.08f,1.08f),
                    (p.y + v.y*dt*gain).coerceIn(-0.08f,1.08f),
                    p.z + v.z*dt*0.35f,
                )
            }
        }

        private fun map(p: Vec3): Vec3 {
            val x = 1f - p.x
            return Vec3(x*2f-1f, 1f-p.y*2f, p.z)
        }

        private fun drawNormal(s: TrackingSnapshot) {
            val now = SystemClock.uptimeMillis()
            s.hands.forEach { h ->
                val p = predict(h, now, s.captureTimeMs)
                val tips = ArrayList<Vec3>(h.openFingerIds.size)
                for (id in h.openFingerIds) {
                    p.getOrNull(id)?.let { tips += map(it) }
                }
                if (tips.size >= 2) {
                    val ordered = angularOrder(tips)
                    drawLoop(ordered, floatArrayOf(0.64f,0.32f,1f,0.22f), 7f)
                    drawLoop(ordered, floatArrayOf(0.92f,0.82f,1f,0.93f), 2f)
                    drawPoints(ordered, floatArrayOf(1f,0.95f,1f,0.95f), 11f)
                }
            }
        }

        private fun drawSpell(s: TrackingSnapshot) {
            val now = SystemClock.uptimeMillis()
            s.hands.forEachIndexed { idx, h ->
                if (h.openFingerIds.size < 4) return@forEachIndexed
                val p = predict(h, now, s.captureTimeMs)
                val palmIds = intArrayOf(0,5,9,13,17)
                val palm = palmIds.map { map(p[it]) }
                val cx = palm.sumOf { it.x.toDouble() }.toFloat()/palm.size
                val cy = palm.sumOf { it.y.toDouble() }.toFloat()/palm.size
                val handWidth = hypot(palm[4].x-palm[1].x, palm[4].y-palm[1].y)
                val r = (handWidth*1.35f).coerceIn(0.17f,0.45f)
                val spin = now*0.0013f*(if(idx==0)1f else -1f)
                val orange = floatArrayOf(1f,0.31f,0.035f,0.82f)
                val hot = floatArrayOf(1f,0.78f,0.30f,0.96f)
                val whiteHot = floatArrayOf(1f,0.94f,0.78f,0.98f)
                drawCircle(cx,cy,r,spin,64,orange,9f)
                drawCircle(cx,cy,r,spin,64,hot,3f)
                drawCircle(cx,cy,r*0.74f,-spin*1.4f,48,orange,5f)
                drawCircle(cx,cy,r*0.52f,spin*1.8f,40,hot,2.5f)
                drawRadials(cx,cy,r*0.60f,r*0.86f,spin,16,orange,2f)
                drawStar(cx,cy,r*0.36f,-spin*0.7f,8,whiteHot,2f)
                drawPoints(listOf(Vec3(cx,cy)),whiteHot,14f)
            }
        }

        private fun drawCircle(cx:Float,cy:Float,r:Float,rot:Float,n:Int,color:FloatArray,size:Float){
            val pts=ArrayList<Vec3>(n)
            for(i in 0 until n){val a=rot+i*2f*PI.toFloat()/n;pts+=Vec3(cx+cos(a)*r,cy+sin(a)*r)}
            drawLoop(pts,color,size)
        }
        private fun drawRadials(cx:Float,cy:Float,ri:Float,ro:Float,rot:Float,n:Int,color:FloatArray,size:Float){
            val pts=ArrayList<Vec3>(n*2)
            for(i in 0 until n){val a=rot+i*2f*PI.toFloat()/n;pts+=Vec3(cx+cos(a)*ri,cy+sin(a)*ri);pts+=Vec3(cx+cos(a)*ro,cy+sin(a)*ro)}
            drawRaw(pts,GLES30.GL_LINES,color,size)
        }
        private fun drawStar(cx:Float,cy:Float,r:Float,rot:Float,n:Int,color:FloatArray,size:Float){
            val pts=ArrayList<Vec3>(n)
            for(i in 0 until n){val a=rot+i*2f*PI.toFloat()/n;val rr=if(i%2==0)r else r*.44f;pts+=Vec3(cx+cos(a)*rr,cy+sin(a)*rr)}
            drawLoop(pts,color,size)
        }

        private fun angularOrder(points: List<Vec3>): List<Vec3> {
            val cx=points.map{it.x}.average().toFloat(); val cy=points.map{it.y}.average().toFloat()
            return points.sortedBy { atan2(it.y-cy,it.x-cx) }
        }

        private fun drawLoop(points: List<Vec3>, color: FloatArray, size: Float) = drawRaw(points,GLES30.GL_LINE_LOOP,color,size)
        private fun drawPoints(points: List<Vec3>, color: FloatArray, size: Float) = drawRaw(points,GLES30.GL_POINTS,color,size)

        private fun drawRaw(points: List<Vec3>, mode: Int, color: FloatArray, size: Float) {
            if(points.isEmpty()) return
            var k=0
            points.forEach{p->verts[k++]=p.x;verts[k++]=p.y}
            val fb: FloatBuffer = ByteBuffer.allocateDirect(k*4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply{put(verts,0,k);position(0)}
            GLES30.glUseProgram(program)
            GLES30.glUniform4fv(uColor,1,color,0)
            GLES30.glLineWidth(size)
            GLES30.glEnableVertexAttribArray(aPos)
            GLES30.glVertexAttribPointer(aPos,2,GLES30.GL_FLOAT,false,0,fb)
            GLES30.glDrawArrays(mode,0,points.size)
            GLES30.glDisableVertexAttribArray(aPos)
        }

        private fun makeProgram(vs:String,fs:String):Int{
            fun sh(type:Int,src:String):Int=GLES30.glCreateShader(type).also{s->GLES30.glShaderSource(s,src);GLES30.glCompileShader(s)}
            return GLES30.glCreateProgram().also{p->val v=sh(GLES30.GL_VERTEX_SHADER,vs);val f=sh(GLES30.GL_FRAGMENT_SHADER,fs);GLES30.glAttachShader(p,v);GLES30.glAttachShader(p,f);GLES30.glLinkProgram(p);GLES30.glDeleteShader(v);GLES30.glDeleteShader(f)}
        }

        companion object {
            private const val VS = """#version 300 es
                in vec2 aPos;
                void main(){ gl_Position=vec4(aPos,0.0,1.0); gl_PointSize=12.0; }
            """
            private const val FS = """#version 300 es
                precision mediump float;
                uniform vec4 uColor;
                out vec4 fragColor;
                void main(){ fragColor=uColor; }
            """
        }
    }
}
