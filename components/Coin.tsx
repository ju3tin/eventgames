'use client'
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CoinData {
  id: string
  x: number
  y: number
  z: number
}

interface CoinProps {
  data: CoinData[]
  collectedIds: Set<string>
  version: number   // ✅ ADD THIS
}

export const Coin: React.FC<CoinProps> = ({ data, collectedIds, version }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = new THREE.Object3D()

  // Spin animation
  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 3
  })

  useEffect(() => {
    if (!meshRef.current) return

    let index = 0

    data.forEach((coin) => {
      if (collectedIds.has(coin.id)) return

      dummy.position.set(coin.x, coin.y, coin.z)
      dummy.rotation.set(Math.PI / 2, 0, 0)
      dummy.updateMatrix()

      meshRef.current.setMatrixAt(index, dummy.matrix)
      index++
    })

    meshRef.current.count = index
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [data, version]) // ✅ use version here

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, data.length]}
      castShadow
    >
      <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
      <meshStandardMaterial
        color="#facc15"
        metalness={0.9}
        roughness={0.2}
        emissive="#f59e0b"
        emissiveIntensity={0.8}
      />
    </instancedMesh>
  )
}
