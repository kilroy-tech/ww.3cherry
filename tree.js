import * as THREE from "three";

/**
 * Create a 3D cherry blossom tree with trunk, main branches, and secondary branches.
 * @returns {THREE.Group} A group containing the complete tree geometry.
 */
export function createTree() {
    const tree = new THREE.Group();

    // ── Materials ──────────────────────────────────────────────────
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3520,
        roughness: 0.9,
        metalness: 0.0,
    });

    const branchMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.9,
        metalness: 0.0,
    });

    const secondaryBranchMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b5040,
        roughness: 0.9,
        metalness: 0.0,
    });

    // ── Helper: create a curved trunk using TubeGeometry ───────────
    function createTrunk() {
        // Define a curved path for the trunk using a CatmullRom curve
        const trunkPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.15, 1.5, 0.1),
            new THREE.Vector3(-0.1, 3.0, -0.05),
            new THREE.Vector3(0.2, 4.5, 0.15),
            new THREE.Vector3(-0.05, 6.0, -0.1),
            new THREE.Vector3(0.1, 7.5, 0.05),
            new THREE.Vector3(0, 8.5, 0),
        ];

        const trunkCurve = new THREE.CatmullRomCurve3(trunkPoints);
        const trunkGeometry = new THREE.TubeGeometry(trunkCurve, 32, 0.35, 12, false);

        const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        return trunkMesh;
    }

    // ── Helper: create a branch extending from a point ─────────────
    function createBranch(startPoint, endPoint, radius, material) {
        const branchCurve = new THREE.CatmullRomCurve3([
            startPoint,
            new THREE.Vector3(
                (startPoint.x + endPoint.x) / 2 + (Math.random() - 0.5) * 0.3,
                (startPoint.y + endPoint.y) / 2,
                (startPoint.z + endPoint.z) / 2 + (Math.random() - 0.5) * 0.3,
            ),
            endPoint,
        ]);

        const branchGeometry = new THREE.TubeGeometry(branchCurve, 16, radius, 8, false);
        const branchMesh = new THREE.Mesh(branchGeometry, material);
        branchMesh.castShadow = true;
        branchMesh.receiveShadow = true;
        return branchMesh;
    }

    // ── Trunk ──────────────────────────────────────────────────────
    tree.add(createTrunk());

    // ── Main branches (thick, extending outward and upward) ────────
    const mainBranches = [
        // Branch 1: extends right and up
        {
            start: new THREE.Vector3(0.15, 2.5, 0.1),
            end: new THREE.Vector3(3.5, 5.5, 1.0),
            radius: 0.2,
        },
        // Branch 2: extends left and up
        {
            start: new THREE.Vector3(-0.1, 3.0, -0.05),
            end: new THREE.Vector3(-3.0, 6.0, -1.5),
            radius: 0.18,
        },
        // Branch 3: extends forward and up
        {
            start: new THREE.Vector3(0.2, 4.0, 0.15),
            end: new THREE.Vector3(1.5, 6.5, 3.5),
            radius: 0.17,
        },
        // Branch 4: extends backward and up
        {
            start: new THREE.Vector3(-0.05, 4.5, -0.1),
            end: new THREE.Vector3(-2.0, 7.0, -3.0),
            radius: 0.16,
        },
        // Branch 5: extends right-forward and up
        {
            start: new THREE.Vector3(0.2, 5.0, 0.1),
            end: new THREE.Vector3(4.0, 7.5, 2.5),
            radius: 0.14,
        },
        // Branch 6: extends left-backward and up
        {
            start: new THREE.Vector3(-0.1, 5.5, -0.05),
            end: new THREE.Vector3(-3.5, 8.0, -2.0),
            radius: 0.13,
        },
    ];

    for (const branch of mainBranches) {
        tree.add(createBranch(branch.start, branch.end, branch.radius, branchMaterial));
    }

    // ── Secondary branches (thinner, extending from main branches) ─
    const secondaryBranches = [
        // From branch 1
        {
            start: new THREE.Vector3(2.0, 4.5, 0.6),
            end: new THREE.Vector3(4.5, 6.5, 1.8),
            radius: 0.08,
        },
        {
            start: new THREE.Vector3(2.8, 5.0, 0.9),
            end: new THREE.Vector3(5.0, 7.0, 2.0),
            radius: 0.06,
        },
        // From branch 2
        {
            start: new THREE.Vector3(-1.8, 5.0, -1.0),
            end: new THREE.Vector3(-4.0, 6.8, -2.2),
            radius: 0.08,
        },
        {
            start: new THREE.Vector3(-2.5, 5.5, -1.3),
            end: new THREE.Vector3(-4.5, 7.2, -2.5),
            radius: 0.06,
        },
        // From branch 3
        {
            start: new THREE.Vector3(1.0, 5.5, 2.5),
            end: new THREE.Vector3(2.5, 7.0, 4.0),
            radius: 0.07,
        },
        {
            start: new THREE.Vector3(1.5, 6.0, 3.0),
            end: new THREE.Vector3(3.0, 7.5, 4.5),
            radius: 0.05,
        },
        // From branch 4
        {
            start: new THREE.Vector3(-1.2, 5.8, -2.0),
            end: new THREE.Vector3(-2.5, 7.2, -3.5),
            radius: 0.07,
        },
        {
            start: new THREE.Vector3(-1.8, 6.2, -2.5),
            end: new THREE.Vector3(-3.0, 7.8, -4.0),
            radius: 0.05,
        },
        // From branch 5
        {
            start: new THREE.Vector3(2.5, 6.0, 1.5),
            end: new THREE.Vector3(4.5, 7.8, 3.0),
            radius: 0.06,
        },
        {
            start: new THREE.Vector3(3.2, 6.5, 2.0),
            end: new THREE.Vector3(5.0, 8.2, 3.5),
            radius: 0.04,
        },
        // From branch 6
        {
            start: new THREE.Vector3(-2.2, 6.5, -1.5),
            end: new THREE.Vector3(-4.0, 8.0, -2.5),
            radius: 0.06,
        },
        {
            start: new THREE.Vector3(-3.0, 7.0, -1.8),
            end: new THREE.Vector3(-4.5, 8.5, -3.0),
            radius: 0.04,
        },
        // Extra secondary branches from trunk upper section
        {
            start: new THREE.Vector3(0.1, 6.5, 0.05),
            end: new THREE.Vector3(2.0, 8.0, 1.0),
            radius: 0.05,
        },
        {
            start: new THREE.Vector3(-0.05, 7.0, -0.1),
            end: new THREE.Vector3(-1.5, 8.2, -1.0),
            radius: 0.04,
        },
        {
            start: new THREE.Vector3(0.05, 7.2, 0.0),
            end: new THREE.Vector3(0.5, 8.5, 1.5),
            radius: 0.04,
        },
    ];

    for (const branch of secondaryBranches) {
        tree.add(createBranch(branch.start, branch.end, branch.radius, secondaryBranchMaterial));
    }

    return tree;
}
