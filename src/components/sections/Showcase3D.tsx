import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Showcase3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create a glass-like torus knot
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd4ff3f,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.0,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xd4ff3f, 2, 10)
    pointLight.position.set(2, 2, 2)
    scene.add(pointLight)
    const pointLight2 = new THREE.PointLight(0x7fe3ff, 1.5, 10)
    pointLight2.position.set(-2, -1, 1)
    scene.add(pointLight2)

    camera.position.z = 4

    // Environment map (simple)
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    const envLight = new THREE.DirectionalLight(0xffffff, 1)
    envScene.add(envLight)
    const envMap = pmremGenerator.fromScene(envScene).texture
    scene.environment = envMap

    let animationId: number
    const animate = () => {
      if (!reduced) {
        mesh.rotation.x += 0.005
        mesh.rotation.y += 0.01
      }
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!canvas) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section className="section section--ink2 zone" id="showcase3d" aria-labelledby="showcase3d-title">
      <div className="container">
        <header className="section-head">
          <h2 id="showcase3d-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 3D 展示</h2>
          <p className="section-head__sub">交互式 3D 作品预览 · 拖拽旋转</p>
        </header>
        <div style={{
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          border: '1px solid var(--c-line)',
          background: 'var(--c-panel)',
        }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '400px',
              display: 'block',
            }}
          />
        </div>
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--c-txt-3)',
          marginTop: 'var(--sp-3)',
        }}>基于 Three.js · 物理渲染材质 · 实时交互</p>
      </div>
    </section>
  )
}
