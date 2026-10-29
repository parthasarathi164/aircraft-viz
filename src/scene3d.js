import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function init3D(containerId) {
    const container = document.getElementById(containerId);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f12); // Dark theme background

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Multi-directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-10, -10, -10);
    scene.add(fillLight);

    // Helpers
    const gridHelper = new THREE.GridHelper(50, 50, 0x00e5ff, 0x222222);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const aircraftGroup = new THREE.Group();
    scene.add(aircraftGroup);

    // 1. Manually Load the JPG Texture File
    // Replace 'material_baseColor.jpg' with your actual image filename inside public/models/textures/
    const textureLoader = new THREE.TextureLoader();
    const planeTexture = textureLoader.load('/models/textures/A380_diffuse.jpg', (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false; // GLTF models require flipY = false for proper UV mapping
        console.log("JPG texture loaded successfully!");
    });

    // 2. Load GLTF Geometry & Force Map Binding
    const loader = new GLTFLoader();

    loader.load(
        '/models/scene.gltf',
        (gltf) => {
            console.log("GLTF geometry loaded successfully!");
            const model = gltf.scene;
            
            // Scaled size 0.35 times
            model.scale.set(0.35, 0.35, 0.35);

            // Traverse all child meshes and apply the loaded JPG texture
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: planeTexture, // Attach the JPG patch texture directly
                        roughness: 0.4,
                        metalness: 0.1,
                        side: THREE.DoubleSide
                    });
                    child.material.needsUpdate = true;
                }
            });

            aircraftGroup.add(model);
        },
        (xhr) => {
            if (xhr.total > 0) {
                console.log(`Loading GLTF: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
            }
        },
        (error) => {
            console.error("Error loading /models/scene.gltf:", error);
        }
    );

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function setCameraView(viewName) {
        switch(viewName) {
            // Home: Inverted to look from the front-quarter perspective (-X, +Y, -Z)
            case 'home': 
                camera.position.set(-15, 12, -22); 
                break;

            // Front: Inverted along the Z-axis (0, 0, -22) to view the aircraft head-on
            case 'front': 
                camera.position.set(0, 0, -22); 
                break;

            // Side: Inverted along the X-axis (-22, 0, 0) to view from the opposite profile
            case 'side': 
                camera.position.set(-22, 0, 0); 
                break;

            // Top: Positioned looking straight down from positive Y with inverted Z alignment
            case 'top': 
                camera.position.set(0, 22, 0.001); 
                break;
        }

        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
    }

    setCameraView('home');

    return { scene, camera, renderer, aircraftGroup, controls, setCameraView };
}