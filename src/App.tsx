import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import {
  LinearSRGBColorSpace,
  TextureLoader,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import "./App.css";

const aoTex = new TextureLoader().load("assets/textures/ao.png");
aoTex.flipY = false;
aoTex.colorSpace = LinearSRGBColorSpace;

function Model() {
  const { nodes: Bnodes, materials: BMaterials } = useGLTF(
    "/assets/snowman_baked.gltf",
  );

  const { geometryWithUV2, material } = useMemo(() => {
    if (!(Bnodes.snowman_A as Mesh)?.geometry)
      return { geometryWithUV2: null, material: null };

    const geom = (Bnodes.snowman_A as Mesh).geometry;

    geom.setAttribute("uv2", geom.attributes.uv1);

    const mat = BMaterials.holiday.clone() as MeshStandardMaterial;

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.aoMap2 = { value: aoTex };
      if (!shader.vertexShader.includes("attribute vec2 uv2")) {
        shader.vertexShader =
          `varying vec2 vUv2;
      attribute vec2 uv2;
      ` + shader.vertexShader;
      } else {
        shader.vertexShader = `varying vec2 vUv2;\n` + shader.vertexShader;
      }
      shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>
            vUv2 = uv2;`,
      );
      shader.fragmentShader =
        `uniform sampler2D aoMap2;\nvarying vec2 vUv2;\n` +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
            vec3 bakedAO = texture2D(aoMap2, vUv2).rgb ;
            diffuseColor.rgb *= mix(vec3(1.0), bakedAO, 1.0);
            // diffuseColor.rgb *= bakedAO;
            `,
      );
    };

    return { geometryWithUV2: geom, material: mat };
  }, [Bnodes, BMaterials]);

  if (!geometryWithUV2 || !material) return null;

  return (
    <group>
      <mesh geometry={geometryWithUV2} material={material} />
    </group>
  );
}
function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

export default App;
useGLTF.preload("/assets/snowman_baked.gltf");
