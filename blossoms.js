import * as THREE from "three";

/**
 * Create a canopy of cherry blossom spheres.
 * @returns {THREE.Group} A group containing 200 pink blossom spheres.
 */
export function createBlossoms() {
    const blossoms = new THREE.Group();

    const blossomMaterial = new THREE.MeshStandardMaterial({
        color: 0xffb7c5,
        roughness: 0.7,
        metalness: 0.0,
    });

    const sphereGeometry = new THREE.SphereGeometry(0.15, 8, 6);

    for (let i = 0; i < 200; i++) {
        const mesh = new THREE.Mesh(sphereGeometry, blossomMaterial);

        // Scatter in canopy shape: x: -4 to 4, z: -4 to 4, y: 4 to 9
        mesh.position.x = (Math.random() - 0.5) * 8; // -4 to 4
        mesh.position.y = 4 + Math.random() * 5;     // 4 to 9
        mesh.position.z = (Math.random() - 0.5) * 8; // -4 to 4

        blossoms.add(mesh);
    }

    return blossoms;
}
