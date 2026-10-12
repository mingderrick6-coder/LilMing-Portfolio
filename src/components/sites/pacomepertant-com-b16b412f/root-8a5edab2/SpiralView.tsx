"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { playHoverSound } from "./SiteChrome";
import styles from "./Views.module.css";

type SpiralViewProps = {
  active: boolean;
  paused: boolean;
  onProjectOpen: (projectIndex: number) => void;
};

type SceneController = {
  setActive: (active: boolean) => void;
};

const vertexShader = /* glsl */ `
  uniform float uScrollSpeed;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    transformed.z += sin(uv.x * 3.141592653589793) * 0.2;

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    viewPosition.x += pow(worldPosition.y, 2.0) * 0.1
      + sin(uv.y * 3.141592653589793) * uScrollSpeed * 2.0;

    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uReveal;
  uniform float uHover;
  varying vec2 vUv;

  float roundedRectSdf(vec2 uv, vec2 size, float radius) {
    vec2 distanceToEdge = abs(uv - 0.5) - size * 0.5 + radius;
    return min(max(distanceToEdge.x, distanceToEdge.y), 0.0)
      + length(max(distanceToEdge, 0.0)) - radius;
  }

  void main() {
    vec2 coverScale = vec2(
      min(uPlaneAspect / uImageAspect, 1.0),
      min(uImageAspect / uPlaneAspect, 1.0)
    );
    vec4 color;

    if (gl_FrontFacing) {
      vec2 zoomedUv = mix(vUv, (vUv - 0.5) / 1.05 + 0.5, uHover);
      vec2 imageUv = (zoomedUv - 0.5) * coverScale + 0.5;
      color = texture2D(uTexture, imageUv);
    } else {
      vec2 imageUv = (vUv - 0.5) * coverScale + 0.5;
      vec2 blurOffset = vec2(40.0 / 1024.0);
      color = (
        texture2D(uTexture, imageUv + blurOffset * vec2(-1.0, -1.0)) * 1.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(0.0, -1.0)) * 2.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(1.0, -1.0)) * 1.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(-1.0, 0.0)) * 2.0
        + texture2D(uTexture, imageUv) * 4.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(1.0, 0.0)) * 2.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(-1.0, 1.0)) * 1.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(0.0, 1.0)) * 2.0
        + texture2D(uTexture, imageUv + blurOffset * vec2(1.0, 1.0)) * 1.0
      ) / 16.0;
    }

    float reveal = clamp(uReveal, 0.0, 1.0);
    vec2 revealSize = vec2(reveal);
    float radius = 0.05 * reveal;
    float sdf = roundedRectSdf(vUv, revealSize, radius);
    float alpha = 1.0 - smoothstep(0.0, 0.002, sdf);
    alpha *= smoothstep(0.1, 1.0, uReveal);
    gl_FragColor = vec4(color.rgb, color.a * alpha);
    #include <colorspace_fragment>
  }
`;

const meshCount = projects.length * 2;
const centerIndex = 9;

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

export default function SpiralView({ active, paused, onProjectOpen }: SpiralViewProps) {
  const stageRef = useRef<HTMLElement>(null);
  const activeRef = useRef(active);
  const pausedRef = useRef(paused);
  const controllerRef = useRef<SceneController | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  activeRef.current = active;
  pausedRef.current = paused;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scene = new THREE.Scene();
    const isMobile = () => window.innerWidth <= 900;
    const camera = new THREE.PerspectiveCamera(
      isMobile() ? 45 : 35,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = styles.spiralCanvas;
    renderer.domElement.setAttribute("aria-hidden", "true");
    stage.prepend(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(1, 1, 8, 8);
    const loader = new THREE.TextureLoader();
    const meshes: Array<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>> = [];
    const textures = projects.map((project) => {
      const texture = loader.load(project.thumbnail, (loadedTexture) => {
        const image = loadedTexture.image as { width?: number; height?: number };
        const aspect = image.width && image.height ? image.width / image.height : 1;
        meshes.forEach((mesh) => {
          if (mesh.material.uniforms.uTexture.value === loadedTexture) {
            mesh.material.uniforms.uImageAspect.value = aspect;
          }
        });
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    });

    const revealTargets = new Array<number>(meshCount).fill(0);
    const hoverTargets = new Array<number>(meshCount).fill(0);

    for (let index = 0; index < meshCount; index += 1) {
      const projectIndex = index % projects.length;
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uTexture: { value: textures[projectIndex] },
          uImageAspect: { value: 1 },
          uPlaneAspect: { value: 1.7 },
          uReveal: { value: 0 },
          uHover: { value: 0 },
          uScrollSpeed: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1.7, 1, 1);
      mesh.userData.projectIndex = projectIndex;
      mesh.userData.meshIndex = index;
      scene.add(mesh);
      meshes.push(mesh);
    }

    const pointer = new THREE.Vector2(2, 2);
    const raycaster = new THREE.Raycaster();
    const worldNormal = new THREE.Vector3();
    const worldPosition = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const worldQuaternion = new THREE.Quaternion();
    let pointerInside = false;
    let pointerType = "mouse";
    let hoveredMeshIndex = -1;
    let scrollTarget = 0;
    let wheelDelta = 0;
    let scrollOffset = 0;
    let lastDirection = 1;
    let animationFrame = 0;
    let staggerTimers: number[] = [];
    let pointerDownX = 0;
    let pointerDownY = 0;
    let previousPointerX = 0;
    let previousPointerTime = 0;
    let activePointerId: number | null = null;
    let dragged = false;

    const updatePointer = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      pointerInside = true;
      pointerType = event.pointerType;

    };

    const isFrontFacing = (mesh: THREE.Mesh) => {
      mesh.getWorldQuaternion(worldQuaternion);
      worldNormal.set(0, 0, 1).applyQuaternion(worldQuaternion);
      mesh.getWorldPosition(worldPosition);
      toCamera.copy(camera.position).sub(worldPosition).normalize();
      return worldNormal.dot(toCamera) > 0;
    };

    const pickMesh = () => {
      if (!pointerInside || !activeRef.current || pausedRef.current) return null;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(meshes, false);
      for (const intersection of intersections) {
        const mesh = intersection.object as (typeof meshes)[number];
        const meshIndex = mesh.userData.meshIndex as number;
        if (mesh.material.uniforms.uReveal.value > 0.55 && isFrontFacing(mesh)) {
          return { mesh, meshIndex };
        }
      }
      return null;
    };

    const updateHover = () => {
      const hit = pickMesh();
      const nextMeshIndex = hit?.meshIndex ?? -1;
      if (nextMeshIndex === hoveredMeshIndex) return;

      hoveredMeshIndex = nextMeshIndex;
      hoverTargets.fill(0);
      if (hit) {
        hoverTargets[nextMeshIndex] = 1;
        if (pointerType !== "touch") playHoverSound();
      }
      renderer.domElement.style.cursor = hit ? "pointer" : "default";
      setHoveredProject(hit ? (hit.mesh.userData.projectIndex as number) : null);
    };

    const setSceneActive = (nextActive: boolean) => {
      staggerTimers.forEach((timer) => window.clearTimeout(timer));
      staggerTimers = [];

      if (!nextActive) {
        pointerInside = false;
        hoveredMeshIndex = -1;
        hoverTargets.fill(0);
        renderer.domElement.style.cursor = "default";
        setHoveredProject(null);
      }

      meshes.forEach((_, index) => {
        const delay = (index % 4) * (nextActive ? 50 : 30);
        const timer = window.setTimeout(() => {
          revealTargets[index] = nextActive ? 1 : 0;
        }, delay);
        staggerTimers.push(timer);
      });
    };

    controllerRef.current = { setActive: setSceneActive };
    setSceneActive(activeRef.current);

    const onWheel = (event: WheelEvent) => {
      if (!activeRef.current || pausedRef.current) return;
      const input = event.deltaY * 0.0015;
      scrollTarget = THREE.MathUtils.clamp(scrollTarget + input, -2, 2);
      if (input !== 0) lastDirection = Math.sign(input);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!activeRef.current || pausedRef.current) return;
      updatePointer(event);
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      previousPointerX = event.clientX;
      previousPointerTime = performance.now();
      activePointerId = event.pointerId;
      dragged = false;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!activeRef.current || pausedRef.current) return;
      updatePointer(event);

      if (activePointerId !== event.pointerId || !isMobile()) return;
      const travel = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
      if (travel > 8) dragged = true;
      if (!dragged) return;

      const now = performance.now();
      const elapsed = Math.max(now - previousPointerTime, 8);
      const horizontalSpeed = (event.clientX - previousPointerX) / elapsed;
      const input = -horizontalSpeed * 0.06;
      scrollTarget = THREE.MathUtils.clamp(scrollTarget + input, -2, 2);
      if (input !== 0) lastDirection = Math.sign(input);
      previousPointerX = event.clientX;
      previousPointerTime = now;
    };

    const finishPointer = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      updatePointer(event);
      if (!dragged && activeRef.current && !pausedRef.current) {
        const hit = pickMesh();
        if (hit) {
          const projectIndex = hit.mesh.userData.projectIndex as number;
          onProjectOpen(projectIndex);
        }
      }
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      activePointerId = null;
    };

    const cancelPointer = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      activePointerId = null;
      dragged = false;
    };

    const onPointerLeave = () => {
      if (activePointerId !== null) return;
      pointerInside = false;
      updateHover();
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = isMobile() ? 45 : 35;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const render = () => {
      animationFrame = window.requestAnimationFrame(render);

      if (!pausedRef.current) {
        if (lastDirection !== 0 && Math.abs(scrollTarget) < 0.002) {
          scrollTarget = lastDirection * 0.002;
        }
        wheelDelta += (scrollTarget - wheelDelta) * 0.1;
        scrollOffset += wheelDelta;
        scrollTarget *= 0.9;
      }

      meshes.forEach((mesh, index) => {
        const relative = wrap(index - scrollOffset, meshCount) - centerIndex;
        const y = relative * 0.5 - 0.8;
        const angle = relative * 0.85;
        mesh.position.set(Math.cos(angle) * 2, y, Math.sin(angle) * 2);
        mesh.rotation.y = -angle + Math.PI / 2;

        const uniforms = mesh.material.uniforms;
        uniforms.uScrollSpeed.value = wheelDelta;
        uniforms.uReveal.value += (revealTargets[index] - uniforms.uReveal.value) * 0.1;
        uniforms.uHover.value += (hoverTargets[index] - uniforms.uHover.value) * 0.1;
      });

      updateHover();
      renderer.render(scene, camera);
    };

    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", finishPointer);
    renderer.domElement.addEventListener("pointercancel", cancelPointer);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      staggerTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", finishPointer);
      renderer.domElement.removeEventListener("pointercancel", cancelPointer);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      meshes.forEach((mesh) => mesh.material.dispose());
      textures.forEach((texture) => texture.dispose());
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      controllerRef.current = null;
    };
  }, [onProjectOpen]);

  useEffect(() => {
    controllerRef.current?.setActive(active);
  }, [active]);

  const project = hoveredProject === null ? null : projects[hoveredProject];

  return (
    <section
      ref={stageRef}
      className={`${styles.spiralView} ${active ? styles.spiralActive : styles.spiralInactive}`}
      aria-hidden={!active}
    >
      <div
        className={`${styles.spiralInfo} ${project ? styles.spiralInfoVisible : ""}`}
        aria-hidden="true"
      >
        {project && (
          <div className={styles.spiralInfoContent}>
            <img src={project.thumbnail} alt="" />
            <span>{project.title}</span>
          </div>
        )}
      </div>
    </section>
  );
}
