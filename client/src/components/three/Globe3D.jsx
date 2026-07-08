import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Convert lat/lng to 3D vector on sphere
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

const UK = { lat: 51.5, lng: -0.12 }
const NIGERIA = { lat: 9.08, lng: 8.68 }

function GlobeMesh() {
  const groupRef = useRef()
  const radius = 2

  const ukPos = useMemo(() => latLngToVector3(UK.lat, UK.lng, radius + 0.02), [])
  const ngPos = useMemo(() => latLngToVector3(NIGERIA.lat, NIGERIA.lng, radius + 0.02), [])

  // Arc curve between UK and Nigeria
  const arcCurve = useMemo(() => {
    const mid = ukPos.clone().add(ngPos).multiplyScalar(0.5).normalize().multiplyScalar(radius + 0.6)
    return new THREE.QuadraticBezierCurve3(ukPos, mid, ngPos)
  }, [ukPos, ngPos])

  const arcPoints = useMemo(() => arcCurve.getPoints(50), [arcCurve])

  const planeRef = useRef()
  const progress = useRef(0)

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06
    progress.current += delta * 0.15
    if (progress.current > 1) progress.current = 0
    if (planeRef.current) {
      const pt = arcCurve.getPoint(progress.current)
      planeRef.current.position.copy(pt)
    }
  })

  // Grid lines (latitude/longitude)
  const gridLines = useMemo(() => {
    const lines = []
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = []
      for (let lng = -180; lng <= 180; lng += 5) {
        points.push(latLngToVector3(lat, lng, radius))
      }
      lines.push(points)
    }
    for (let lng = -180; lng <= 150; lng += 30) {
      const points = []
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToVector3(lat, lng, radius))
      }
      lines.push(points)
    }
    return lines
  }, [])

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color='#0A1D56' transparent opacity={0.85} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid wireframe */}
      {gridLines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach='attributes-position'
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color='#D4A017' transparent opacity={0.15} />
        </line>
      ))}

      {/* UK marker */}
      <mesh position={ukPos}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color='#D4A017' />
      </mesh>
      <pointLight position={ukPos} color='#D4A017' intensity={0.5} distance={1} />

      {/* Nigeria marker */}
      <mesh position={ngPos}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color='#008751' />
      </mesh>
      <pointLight position={ngPos} color='#008751' intensity={0.5} distance={1} />

      {/* Flight arc */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={arcPoints.length}
            array={new Float32Array(arcPoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color='#e8b82a' transparent opacity={0.6} />
      </line>

      {/* Flying plane marker */}
      <mesh ref={planeRef}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color='#ffffff' />
      </mesh>
    </group>
  )
}

export default function Globe3D({ height = '500px' }) {
  return (
    <div style={{ width: '100%', height, cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1} color='#ffffff' />
        <pointLight position={[-5, -3, -5]} intensity={0.3} color='#D4A017' />
        <GlobeMesh />
      </Canvas>
    </div>
  )
}
