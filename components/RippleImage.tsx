"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Image from "next/image";

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform vec2 uAspect;
  uniform vec2 uCoverScale;
  uniform vec2 uCoverOffset;

  void main() {
    vec2 diff = vUv - uMouse;
    diff *= uAspect;
    float dist = length(diff);
    float falloff = smoothstep(0.22, 0.0, dist);
    float strength = falloff * uHover * 0.05;
    vec2 dir = dist > 0.0001 ? normalize(diff) : vec2(0.0);

    vec2 imageUv = vUv * uCoverScale + uCoverOffset;
    vec2 displaced = imageUv - dir * strength;
    gl_FragColor = texture2D(uTexture, displaced);
  }
`;

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function RippleImage({ src, alt, className = "", priority = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uAspect: { value: new THREE.Vector2(1, 1) },
      uCoverScale: { value: new THREE.Vector2(1, 1) },
      uCoverOffset: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let disposed = false;
    let targetHover = 0;
    let currentHover = 0;

    function updateCover() {
      const tex = uniforms.uTexture.value;
      if (!tex || !tex.image) return;
      const cw = container!.clientWidth;
      const ch = container!.clientHeight;
      const img = tex.image as HTMLImageElement;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!cw || !ch || !iw || !ih) return;

      const containerAspect = cw / ch;
      const imageAspect = iw / ih;
      let scaleX = 1;
      let scaleY = 1;
      if (containerAspect > imageAspect) {
        scaleY = imageAspect / containerAspect;
      } else {
        scaleX = containerAspect / imageAspect;
      }
      uniforms.uCoverScale.value.set(scaleX, scaleY);
      uniforms.uCoverOffset.value.set((1 - scaleX) / 2, (1 - scaleY) / 2);
      uniforms.uAspect.value.set(1, ch / cw);
    }

    function resize() {
      const cw = container!.clientWidth;
      const ch = container!.clientHeight;
      if (!cw || !ch) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(cw, ch, false);
      updateCover();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const loader = new THREE.TextureLoader();
    loader.load(src, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      uniforms.uTexture.value = tex;
      updateCover();
      setReady(true);
    });

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(x, y);
    }
    function onMouseEnter() {
      targetHover = 1;
    }
    function onMouseLeave() {
      targetHover = 0;
    }

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    let rafId: number;
    function tick() {
      currentHover += (targetHover - currentHover) * 0.08;
      uniforms.uHover.value = currentHover;
      if (uniforms.uTexture.value) {
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      geometry.dispose();
      material.dispose();
      uniforms.uTexture.value?.dispose();
      renderer.dispose();
    };
  }, [src]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 w-full h-full transition-opacity duration-500"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
