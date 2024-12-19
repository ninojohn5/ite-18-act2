import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e2749); // Dark blue background
scene.fog = new THREE.FogExp2(0x1e2749, 0.03); // Add fog to the scene

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 10); // Position the camera to view the scene

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Set shadow map type for softer shadows
document.body.appendChild(renderer.domElement);

// Flat Ground (Plane)
const groundGeometry = new THREE.PlaneGeometry(33,55); // Flat square plane
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xa39027, flatShading: true });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat horizontally
ground.position.set(0, -1.5, 0); // Position it at ground level
ground.receiveShadow = true; // Allow ground to receive shadows
scene.add(ground);


// Tree Trunk (Adjust to touch the ground)
const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 6); // Small cylinder for the tree trunk
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown color
const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

// Adjust the trunk position to align its base with the ground
trunk.position.set(0, -1.0, 0); // Move it so the bottom touches the ground
trunk.castShadow = true; // Allow trunk to cast shadows
trunk.receiveShadow = true; // Allow trunk to receive shadows
scene.add(trunk);

// Tree Leaves
const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x228b22, // Dark green color
    flatShading: true
});

function createLeafCone(size, yOffset) {
    const leafGeometry = new THREE.ConeGeometry(size, size * 2, 6);
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(0, yOffset, 0);
    leaf.castShadow = true; // Allow leaves to cast shadows
    leaf.receiveShadow = true; // Allow leaves to receive shadows
    return leaf;
}

const leaf1 = createLeafCone(1.5, 0.5); // Bottom cone 
const leaf2 = createLeafCone(1.2, 1.5); // Middle cone
const leaf3 = createLeafCone(0.9, 2.3); // Top cone

scene.add(leaf1, leaf2, leaf3);


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft ambient light
scene.add(ambientLight);

// Directional Light (creates shadows)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Strong directional light
directionalLight.position.set(5, 10, 5); // Set light position
directionalLight.castShadow = true; // Enable shadows for this light
scene.add(directionalLight);

// Point Light (more dynamic lighting)
const pointLight = new THREE.PointLight(0xffffff, 1, 20); // Point light with intensity and distance
pointLight.position.set(2, 5, 2); // Position it in the scene
pointLight.castShadow = true; // Enable shadow casting for point light
scene.add(pointLight);

//create trees behinde the camping
function createTree(position) {
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    trunk.position.set(0,0.9, 0); 
    trunk.castShadow = true;

    // Create leaves
    const leaf1 = createLeafCone(1.5, 2.5); 
    const leaf2 = createLeafCone(1.2, 3.5);
    const leaf3 = createLeafCone(0.9, 4.5);

    // Group the trunk and leaves
    const tree = new THREE.Group();
    tree.add(trunk, leaf1, leaf2, leaf3);

    
    tree.position.set(position.x, -1.9, position.z); // Ground level at y = -1.5
    return tree;
}


function createForest(area, treeCount) {
    const forest = new THREE.Group();
    for (let i = 0; i < treeCount; i++) {
        const x = Math.random() * area.width - area.width / 2; // Spread trees randomly in X
        const z = Math.random() * area.depth - area.depth / 2; // Spread trees randomly in Z
        const tree = createTree({ x, y: -1.5, z: z - area.offset });
        forest.add(tree);
    }
    return forest;
}

// Add the forest behind the camp
const forest = createForest(
    { width: 30, depth: 20, offset: 15 }, // Area settings: width, depth, offset behind the camp
    100 // Number of trees in the forest
);
scene.add(forest);

function createRock(size, position, rotation) {
    const rockGeometry = new THREE.DodecahedronGeometry(size, 0); // Rock shape
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 }); // Gray color for rocks
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(position.x, position.y, position.z);
    rock.rotation.set(rotation.x, rotation.y, rotation.z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

function addRocksAroundCampfire(center, radius, rockCount) {
    const rocks = new THREE.Group();
    for (let i = 0; i < rockCount; i++) {
        const angle = (i / rockCount) * Math.PI * 2; // Divide the circle into equal parts
        const x = center.x + Math.cos(angle) * radius;
        const z = center.z + Math.sin(angle) * radius;
        const y = center.y; // Align with ground level

        // Create a rock with random size and rotation
        const size = Math.random() * 0.2 + 0.1; // Random size between 0.1 and 0.3
        const rotation = {
            x: Math.random() * Math.PI,
            y: Math.random() * Math.PI,
            z: Math.random() * Math.PI,
        };

        const rock = createRock(size, { x, y, z }, rotation);
        rocks.add(rock);
    }
    return rocks;
}

// Add rocks around the campfire
const rocks = addRocksAroundCampfire({ x: 3, y: -1.4, z: 0 }, 0.7, 12); // Centered around the campfire
scene.add(rocks);


// Campfire (Beside the Tree)
const fireBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 6); // Base of the campfire
const fireBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x7f5539 }); // Dark brown base
const fireBase = new THREE.Mesh(fireBaseGeometry, fireBaseMaterial);
fireBase.position.set(3, -1.4, 0); // Position the base near the tree
fireBase.receiveShadow = true;
scene.add(fireBase);

// Load a wood texture for the logs
const textureLoader = new THREE.TextureLoader();
const logTexture = textureLoader.load('/texture/wood.jpg');


// Camping Logs (with texture)
function createLog(position, rotation) {
    const logGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 6); // Shorter logs
    const logMaterial = new THREE.MeshStandardMaterial({ map: logTexture }); // Apply wood texture
    const log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.set(position.x, position.y, position.z);
    log.rotation.set(rotation.x, rotation.y, rotation.z); // Apply rotation for X-positioned logs
    log.castShadow = true;
    log.receiveShadow = true;
    return log;
}

// Create two logs that cross each other (X-shape arrangement) and lay flat
const log1 = createLog({ x: 3, y: -1.3, z: 0 }, { x: 0, y: Math.PI / 4, z: 0 }); // First log rotated at 45 degrees
const log2 = createLog({ x: 3, y: -1.3, z: 0 }, { x: 0, y: -Math.PI / 4, z: 0 }); // Second log rotated at -45 degrees

// Adjust the logs to lay down flat
log1.rotation.x = 0; // Keep log 1 flat
log1.rotation.z = Math.PI / 2; // Ensure the log is laid down flat on the ground (90 degrees on Z-axis)

log2.rotation.x = 0; // Keep log 2 flat
log2.rotation.z = Math.PI / 2; // Ensure the log is laid down flat on the ground (90 degrees on Z-axis)

// Add logs to the scene
scene.add(log1, log2);

// Firelight for the campfire
const fireLight = new THREE.PointLight(0xffa500, 1, 10); // Orange firelight
fireLight.position.set(3.25, -1, 0); // Position it at the center of the logs (adjust to be inside the crossed logs)
fireLight.castShadow = true;
scene.add(fireLight);

// Flickering Firelight (Random Intensity with stronger flicker)
function flickerFirelight() {
    fireLight.intensity = Math.random() * 1.5 + 0.5; // Increase the range of intensity from 0.5 to 2.0
    requestAnimationFrame(flickerFirelight); // Keep updating the intensity
}
flickerFirelight();

// Create a medium-sized horizontal log (adjusted for a chair-like placement)
function createChairLog(position, rotation) {
    const chairLogGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 12); // Medium-sized log
    const chairLogMaterial = new THREE.MeshStandardMaterial({ map: logTexture }); // Apply wood texture
    const chairLog = new THREE.Mesh(chairLogGeometry, chairLogMaterial);
    chairLog.position.set(position.x, position.y, position.z); // Set position to move it away from fire
    chairLog.rotation.set(rotation.x, rotation.y, rotation.z); // Set correct orientation
    chairLog.castShadow = true;
    chairLog.receiveShadow = true;
    return chairLog;
}

// Add the chair log to the scene, positioned horizontally and away from the fire
const chairLog = createChairLog(
    { x: 2.5, y: -1.3, z: -1.2}, // Positioned to the side of the fire
    { x: Math.PI / 2, y: 0, z: 1.3 } // Lying flat horizontally, not pointing at the fire
);
scene.add(chairLog);

// Create a starry sky
function createStarrySky() {
    const starCount = 5000; // Number of stars
    const starGeometry = new THREE.BufferGeometry(); // Geometry for the stars
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff, // White color for stars
        size: 0.05, // Small size for stars
    });

    // Generate random positions for the stars
    const positions = new Float32Array(starCount * 3); // Each star has x, y, z
    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100; 
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100; 
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create the starry points mesh and add it to the scene
    const stars = new THREE.Points(starGeometry, starMaterial);
    return stars;
}

// Add the starry sky to the scene
const starrySky = createStarrySky();
scene.add(starrySky);


function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(2, 20, 20); // Larger moon
    const moonTexture = new THREE.TextureLoader().load(
        '/texture/moon.jpg', // Correct relative path
        () => console.log("Moon texture loaded"),
        undefined,
        (err) => console.error("Failed to load moon texture:", err)
    );
    

    const moonMaterial = new THREE.MeshStandardMaterial({
        map: moonTexture,
        emissive: new THREE.Color(0xffffff), // Glow effect
        emissiveIntensity: 0.3,
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(5, 15, -15); // Bring the moon closer to the camera
    moon.castShadow = true;

   // Directional Light (Moonlight) - Updated
const moonLight = new THREE.DirectionalLight(0xb0c4de, 0.8); // Soft, cool moonlight
moonLight.position.set(5, 10, -10); // Same position as the moon
moonLight.target = ground; // Focus the moonlight on the ground
moonLight.castShadow = true; // Enable shadows for the moonlight
// Disable shadows for other lights
directionalLight.castShadow = false; // Prevent directional light from casting shadows
pointLight.castShadow = false;      // Prevent point light from casting shadows

// Configure moonlight to be the sole shadow caster
moonLight.castShadow = true; // Ensure moonlight casts shadows

// Moonlight shadow settings for better quality and soft edges
moonLight.shadow.mapSize.width = 2048; // High-resolution shadow map
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 50;
moonLight.shadow.camera.left = -15;
moonLight.shadow.camera.right = 15;
moonLight.shadow.camera.top = 15;
moonLight.shadow.camera.bottom = -15;
moonLight.shadow.radius = 4; // Soft shadow edges
moonLight.shadow.bias = -0.002; // Adjust to prevent shadow artifacts


scene.add(moonLight);

    return moon;
}



// Add the moon to the scene
const moon = createMoon();
scene.add(moon);

function createFireflies(count, radius, position) {
    const fireflies = new THREE.Group();
    const fireflyGeometry = new THREE.SphereGeometry(0.03, 8, 8); // Small sphere
    const fireflyMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Use basic material for a glowing effect

    for (let i = 0; i < count; i++) {
        const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
        firefly.position.set(
            position.x + (Math.random() - 0.5) * radius,
            position.y + Math.random() * 2,
            position.z + (Math.random() - 0.5) * radius
        );
        firefly.userData = {
            velocity: new THREE.Vector3(
                Math.random() * 0.1 - 0.05,
                Math.random() * 0.1 - 0.05,
                Math.random() * 0.1 - 0.05
            ),
        };
        fireflies.add(firefly);
    }
    return fireflies;
}


// Animate Fireflies
function animateFireflies(fireflies) {
    fireflies.children.forEach(firefly => {
        // Update position for random motion
        firefly.position.add(firefly.userData.velocity);

        // Constrain fireflies to stay within the boundaries of the ground (-5 to 5 in x, z directions)
        if (firefly.position.x < -10 || firefly.position.x > 10) firefly.userData.velocity.x *= -1; // Flip direction if outside X bounds
        if (firefly.position.z < -5 || firefly.position.z > 5) firefly.userData.velocity.z *= -1; // Flip direction if outside Z bounds
        
        // Optional: Keep the fireflies within certain height range (if desired)
        if (firefly.position.y < -1.0 || firefly.position.y > 4) firefly.userData.velocity.y *= -1; // Keep within the height of the tree

        // Random flickering effect (change intensity slightly)
        firefly.material.emissiveIntensity = Math.random() * 0.8 + 0.5;
    });
}

// Create fireflies around the tree
const fireflies = createFireflies(100, 2, { x: 0, y: 0, z: 0 }); 
scene.add(fireflies);




// Add OrbitControls to allow interactive camera adjustment
const controls = new OrbitControls(camera, renderer.domElement); // Attach controls to the camera

// GUI for controlling shadow properties
const gui = new dat.GUI();




// Shadow properties for directional light
const directionalShadowFolder = gui.addFolder('Directional Light Shadow');
directionalShadowFolder.add(directionalLight.shadow, 'bias', -0.1, 0.1, 0.01).name('Shadow Bias');
directionalShadowFolder.add(directionalLight.shadow, 'radius', 1, 10, 1).name('Shadow Radius');
directionalShadowFolder.add(directionalLight, 'intensity', 0, 2, 0.1).name('Shadow Intensity');

// Directional light position control
directionalShadowFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('Position X');
directionalShadowFolder.add(directionalLight.position, 'y', -10, 10, 0.1).name('Position Y');
directionalShadowFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('Position Z');

// Close the GUI by default
gui.close();

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls for smooth interaction
    renderer.render(scene, camera);
    animateFireflies(fireflies); // Animate fireflies
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});