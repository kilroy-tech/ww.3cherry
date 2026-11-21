import * as THREE from "three";

const PLANE_SIZE = 100;
const PLANE_SEGMENTS = 128;
const TERRAIN_BUMP_COUNT = 60;
const TERRAIN_BUMP_MAX_HEIGHT = 0.4;
const TERRAIN_BUMP_MIN_RADIUS = 1.5;
const TERRAIN_BUMP_MAX_RADIUS = 5.0;
const DIRT_PATH_WIDTH = 2.5;
const DIRT_PATH_LENGTH = PLANE_SIZE * 0.8;
const TREE_COUNT = 12;
const ROCK_COUNT = 15;

/**
 * Simple seeded PRNG (mulberry32) for reproducible terrain.
 * @param {number} seed
 * @returns {function}
 */
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Check if a point is within the dirt path (a winding curve along Z).
 * @param {number} x
 * @param {number} z
 * @returns {boolean}
 */
function isOnDirtPath(x, z) {
    const halfPath = DIRT_PATH_LENGTH / 2;
    if (z < -halfPath || z > halfPath) return false;
    // Winding path: sine curve offset
    const pathCenterX = Math.sin(z * 0.15) * 3;
    return Math.abs(x - pathCenterX) < DIRT_PATH_WIDTH / 2;
}

/**
 * Create a ground plane with terrain bumps, a dirt path, 12 small trees, and 15 rocks.
 * @returns {THREE.Group} A group containing the complete ground scene.
 */
export function createGround() {
    const ground = new THREE.Group();
    const rng = mulberry32(42); // Fixed seed for reproducibility

    // ── Materials ──────────────────────────────────────────────────
    const grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x556b2f,
        roughness: 1.0,
        metalness: 0.0,
    });

    const dirtMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 1.0,
        metalness: 0.0,
    });

    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x696969,
        roughness: 0.85,
        metalness: 0.05,
    });

    const smallTrunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3520,
        roughness: 0.9,
        metalness: 0.0,
    });

    const smallCanopyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5a1e,
        roughness: 0.9,
        metalness: 0.0,
    });

    // ── Terrain plane with bumps ───────────────────────────────────
    const planeGeometry = new THREE.PlaneGeometry(
        PLANE_SIZE, PLANE_SIZE,
        PLANE_SEGMENTS, PLANE_SEGMENTS
    );

    // Displace vertices for terrain bumps
    const positions = planeGeometry.attributes.position;
    const bumpCenters = [];

    for (let i = 0; i < TERRAIN_BUMP_COUNT; i++) {
        bumpCenters.push({
            x: (rng() - 0.5) * PLANE_SIZE * 0.9,
            z: (rng() - 0.5) * PLANE_SIZE * 0.9,
            height: (rng() * 2 - 1) * TERRAIN_BUMP_MAX_HEIGHT,
            radius: TERRAIN_BUMP_MIN_RADIUS + rng() * (TERRAIN_BUMP_MAX_RADIUS - TERRAIN_BUMP_MIN_RADIUS),
        });
    }

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getY(i); // PlaneGeometry is XY before rotation

        let bumpY = 0;
        for (const bump of bumpCenters) {
            const dx = x - bump.x;
            const dz = z - bump.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < bump.radius) {
                // Gaussian bump
                const factor = Math.exp(-(dist * dist) / (2 * (bump.radius * 0.4) * (bump.radius * 0.4)));
                bumpY += bump.height * factor;
            }
        }

        positions.setZ(i, bumpY); // Z becomes Y after rotation
    }

    planeGeometry.computeVertexNormals();

    // Rotate to lie flat on the ground (XZ plane)
    planeGeometry.rotateX(-Math.PI / 2);

    const groundPlane = new THREE.Mesh(planeGeometry, grassMaterial);
    groundPlane.receiveShadow = true;
    ground.add(groundPlane);

    // ── Dirt path ──────────────────────────────────────────────────
    const pathSegments = 200;
    const pathPoints = [];
    const halfPath = DIRT_PATH_LENGTH / 2;

    for (let i = 0; i <= pathSegments; i++) {
        const z = -halfPath + (i / pathSegments) * DIRT_PATH_LENGTH;
        const x = Math.sin(z * 0.15) * 3;
        pathPoints.push(new THREE.Vector3(x, 0.01, z)); // Slightly above ground to avoid z-fighting
    }

    // Create path as a series of connected quads
    const pathGeometry = new THREE.BufferGeometry();
    const pathVertices = [];
    const pathIndices = [];

    for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = pathPoints[i];
        const p2 = pathPoints[i + 1];

        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x);

        const left1 = new THREE.Vector3().addVectors(p1, new THREE.Vector3().copy(perp).multiplyScalar(DIRT_PATH_WIDTH / 2));
        const right1 = new THREE.Vector3().addVectors(p1, new THREE.Vector3().copy(perp).multiplyScalar(-DIRT_PATH_WIDTH / 2));
        const left2 = new THREE.Vector3().addVectors(p2, new THREE.Vector3().copy(perp).multiplyScalar(DIRT_PATH_WIDTH / 2));
        const right2 = new THREE.Vector3().addVectors(p2, new THREE.Vector3().copy(perp).multiplyScalar(-DIRT_PATH_WIDTH / 2));

        const baseIdx = pathVertices.length / 3;
        pathVertices.push(
            left1.x, left1.y, left1.z,
            right1.x, right1.y, right1.z,
            left2.x, left2.y, left2.z,
            right2.x, right2.y, right2.z,
        );

        pathIndices.push(
            baseIdx, baseIdx + 2, baseIdx + 1,
            baseIdx + 1, baseIdx + 2, baseIdx + 3,
        );
    }

    pathGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pathVertices, 3));
    pathGeometry.setIndex(pathIndices);
    pathGeometry.computeVertexNormals();

    const pathMesh = new THREE.Mesh(pathGeometry, dirtMaterial);
    pathMesh.receiveShadow = true;
    ground.add(pathMesh);

    // ── 12 small decorative trees ──────────────────────────────────
    const treePositions = [];
    for (let i = 0; i < TREE_COUNT; i++) {
        let tx, tz;
        let attempts = 0;
        do {
            tx = (rng() - 0.5) * PLANE_SIZE * 0.85;
            tz = (rng() - 0.5) * PLANE_SIZE * 0.85;
            attempts++;
        } while (isOnDirtPath(tx, tz) && attempts < 50);

        // Keep away from center (main tree area)
        const distFromCenter = Math.sqrt(tx * tx + tz * tz);
        if (distFromCenter < 6) {
            tx *= 1.5;
            tz *= 1.5;
        }

        treePositions.push({ x: tx, z: tz });
    }

    for (const treePos of treePositions) {
        const smallTree = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
        const trunk = new THREE.Mesh(trunkGeo, smallTrunkMaterial);
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        smallTree.add(trunk);

        // Canopy layers
        const canopySizes = [
            { radius: 0.8, y: 1.6 },
            { radius: 0.6, y: 2.2 },
            { radius: 0.4, y: 2.7 },
        ];

        for (const canopy of canopySizes) {
            const canopyGeo = new THREE.SphereGeometry(canopy.radius, 8, 6);
            const canopyMesh = new THREE.Mesh(canopyGeo, smallCanopyMaterial);
            canopyMesh.position.y = canopy.y;
            canopyMesh.castShadow = true;
            canopyMesh.receiveShadow = true;
            smallTree.add(canopyMesh);
        }

        smallTree.position.set(treePos.x, 0, treePos.z);
        ground.add(smallTree);
    }

    // ── 15 rocks ───────────────────────────────────────────────────
    for (let i = 0; i < ROCK_COUNT; i++) {
        let rx, rz;
        let attempts = 0;
        do {
            rx = (rng() - 0.5) * PLANE_SIZE * 0.85;
            rz = (rng() - 0.5) * PLANE_SIZE * 0.85;
            attempts++;
        } while (isOnDirtPath(rx, rz) && attempts < 30);

        const rockGroup = new THREE.Group();

        // Create irregular rock shape from merged spheres
        const rockParts = 2 + Math.floor(rng() * 3);
        for (let j = 0; j < rockParts; j++) {
            const rockRadius = 0.2 + rng() * 0.4;
            const rockGeo = new THREE.DodecahedronGeometry(rockRadius, 1);

            // Perturb vertices for irregularity
            const rockPos = rockGeo.attributes.position;
            for (let v = 0; v < rockPos.count; v++) {
                const vx = rockPos.getX(v);
                const vy = rockPos.getY(v);
                const vz = rockPos.getZ(v);
                const noise = 0.8 + rng() * 0.4;
                rockPos.setXYZ(v, vx * noise, vy * noise, vz * noise);
            }
            rockGeo.computeVertexNormals();

            const rockMesh = new THREE.Mesh(rockGeo, rockMaterial);
            rockMesh.position.set(
                (rng() - 0.5) * 0.3,
                (rng() - 0.5) * 0.15,
                (rng() - 0.5) * 0.3,
            );
            rockMesh.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
            rockMesh.castShadow = true;
            rockMesh.receiveShadow = true;
            rockGroup.add(rockMesh);
        }

        rockGroup.position.set(rx, 0, rz);
        ground.add(rockGroup);
    }

    return ground;
}
