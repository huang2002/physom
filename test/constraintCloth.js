// @ts-check
/// <reference path="./common.js" />

const CONSTRAINT_CLOTH_X0 = 100;
const CONSTRAINT_CLOTH_Y0 = 100;
const CONSTRAINT_CLOTH_ROWS = 15;
const CONSTRAINT_CLOTH_COLUMNS = 15;
const CONSTRAINT_CLOTH_NODE_GAP = 30;
const CONSTRAINT_CLOTH_NODE_EDGES = 6;
const CONSTRAINT_CLOTH_NODE_VERTICES = COM.Vertices.createRegularPolygon(
    CONSTRAINT_CLOTH_NODE_EDGES,
    CONSTRAINT_CLOTH_NODE_GAP * 0.5,
    Math.PI / CONSTRAINT_CLOTH_NODE_EDGES,
);

const resetConstraintClothScene = () => {
    const nodes = /** @type {POM.BodyNode<any>[]} */(
        constraintClothScene.selectClass('cloth-node')
    );
    nodes.forEach((node, index) => {
        const rowIndex = Math.floor(index / CONSTRAINT_CLOTH_COLUMNS);
        const columnIndex = index % CONSTRAINT_CLOTH_ROWS;
        node.velocity.set(0, 0);
        node.offset.set(
            CONSTRAINT_CLOTH_X0 + CONSTRAINT_CLOTH_NODE_GAP * columnIndex,
            CONSTRAINT_CLOTH_Y0 + CONSTRAINT_CLOTH_NODE_GAP * rowIndex,
        );
    });
};

const enterConstraintClothScene = () => {
    resetConstraintClothScene();
    enter(constraintClothScene);
};

/**
 * @param {boolean} active
 */
const ClothNode = (active) => (
    COM.create(POM.BodyNode, {
        classNames: ['cloth-node'],
        active,
        vertices: CONSTRAINT_CLOTH_NODE_VERTICES,
        gravity: commonGravity,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    })
);

/**
 * @param {POM.BodyNode<any>} bodyA
 * @param {POM.BodyNode<any>} bodyB
 * @returns {COM.CanvasNode<any>}
 */
const ClothNodeConstraint = (bodyA, bodyB) => (
    new POM.ConstraintNode({
        bodyA,
        bodyB,
        minLength: 0,
        maxLength: CONSTRAINT_CLOTH_NODE_GAP,
        stiffness: 0.7,
        elasticity: 0.1,
        style: {
            strokeStyle: '#0C0',
        },
    })
);

const constraintClothScene = COM.create(POM.WorldNode, {
    id: 'constraint-cloth-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
});

/**
 * @type {POM.BodyNode<any>[][]}
 */
const clothNodes = [];
for (let rowIndex = 0; rowIndex < CONSTRAINT_CLOTH_ROWS; rowIndex++) {
    clothNodes.push([]);
    for (let columnIndex = 0; columnIndex < CONSTRAINT_CLOTH_COLUMNS; columnIndex++) {
        const clothNode = ClothNode(rowIndex > 0);
        clothNodes[clothNodes.length - 1].push(clothNode);
        constraintClothScene.appendChild(
            /** @type {COM.CanvasNode<any>} */(clothNode)
        );
    }
}

for (let rowIndex = 0; rowIndex < CONSTRAINT_CLOTH_ROWS; rowIndex++) {
    for (let columnIndex = 0; columnIndex < CONSTRAINT_CLOTH_COLUMNS; columnIndex++) {
        if (rowIndex > 0) {
            constraintClothScene.appendChild(
                ClothNodeConstraint(
                    clothNodes[rowIndex - 1][columnIndex],
                    clothNodes[rowIndex][columnIndex],
                )
            );
        }
        if (columnIndex > 0) {
            constraintClothScene.appendChild(
                ClothNodeConstraint(
                    clothNodes[rowIndex][columnIndex - 1],
                    clothNodes[rowIndex][columnIndex],
                )
            );
        }
    }
}

constraintClothScene.appendChild(
    /** @type {COM.CanvasNode<any>} */(
        ResetButton(resetConstraintClothScene)
    )
);
