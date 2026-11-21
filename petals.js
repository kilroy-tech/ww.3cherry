import * as THREE from "three";

const PETAL_COUNT = 150;
const PLANE_SIZE = 0.15;
const CANOPY_X_OFFSET = 5; // Tree is at x=5
const CANVAS_X_RANGE = 8; // -4 to 4 (relative to offset)
const CANVAS_Z_RANGE = 8; // -4 to 4
const CANVAS_Y_MIN = 4;
const CANVAS_Y_MAX = 9;
const RESET_Y_MIN = -2;

/**
 * Create 150 falling cherry blossom petals with randomized animation parameters.
 * @returns {THREE.Group} A group containing 150 animated petal planes.
 */
export function createPetals() {
    const petals = new THREE.Group();

    const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0xffb7c5,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);

    for (let i = 0; i < PETAL_COUNT; i++) {
        const mesh = new THREE.Mesh(planeGeometry, petalMaterial);

        // Random canopy positions (offset to match tree at x=5)
        mesh.position.x = CANOPY_X_OFFSET + (Math.random() - 0.5) * CANVAS_X_RANGE;
        mesh.position.y = CANVAS_Y_MIN + Math.random() * (CANVAS_Y_MAX - CANVAS_Y_MIN);
        mesh.position.z = (Math.random() - 0.5) * CANVAS_Z_RANGE;

        // Random animation parameters
        mesh.userData.fallingSpeed = 1.0 + Math.random() * 0.67; // 1.0-1.67 units/sec (3-5 sec fall)
        mesh.userData.swayAmount = 0.3 + Math.random() * 0.5;
        mesh.userData.swaySpeed = 0.5 + Math.random() * 1.0;
        mesh.userData.rotationSpeed = 0.5 + Math.random() * 1.5;
        mesh.userData.initialPhase = Math.random() * Math.PI * 2;

        // Random initial rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;

        petals.add(mesh);
    }

    return petals;
}

/**
 * Update petal positions for falling, swaying, and rotation.
 * Resets petals below y=0 to the top of the canopy.
 * @param {THREE.Group} petals - The petals group returned by createPetals().
 * @param {number} elapsed - Elapsed time in seconds since last update.
 */
export function update(petals, elapsed) {
    for (let i = 0; i < petals.children.length; i++) {
        const petal = petals.children[i];
        const ud = petal.userData;

        // Falling: move downward
        petal.position.y -= ud.fallingSpeed * elapsed;

        // Swaying: oscillate x and z
        const swayX = Math.sin(elapsed * ud.swaySpeed + ud.initialPhase) * ud.swayAmount;
        const swayZ = Math.cos(elapsed * ud.swaySpeed * 0.7 + ud.initialPhase) * ud.swayAmount;
        petal.position.x += swayX * elapsed;
        petal.position.z += swayZ * elapsed;

        // Rotation: spin on all axes
        petal.rotation.x += ud.rotationSpeed * elapsed;
        petal.rotation.y += ud.rotationSpeed * 0.7 * elapsed;
        petal.rotation.z += ud.rotationSpeed * 0.5 * elapsed;

        // Reset if below y=0
        if (petal.position.y < RESET_Y_MIN) {
            petal.position.y = CANVAS_Y_MIN + Math.random() * (CANVAS_Y_MAX - CANVAS_Y_MIN);
            petal.position.x = CANOPY_X_OFFSET + (Math.random() - 0.5) * CANVAS_X_RANGE;
            petal.position.z = (Math.random() - 0.5) * CANVAS_Z_RANGE;
        }
    }
}
