// @ts-check
/// <reference path="./common.js" />

const CONSTRAINT_COMPOSITE_X0 = 200;
const CONSTRAINT_COMPOSITE_Y0 = 200;
const CONSTRAINT_COMPOSITE_ROWS = 4;
const CONSTRAINT_COMPOSITE_COLUMNS = 4;
const CONSTRAINT_COMPOSITE_NODE_SIZE = 60;
const CONSTRAINT_COMPOSITE_NODE_EDGES = 12;
const CONSTRAINT_COMPOSITE_NODE_VERTICES = COM.Vertices.createRegularPolygon(
    CONSTRAINT_COMPOSITE_NODE_EDGES,
    CONSTRAINT_COMPOSITE_NODE_SIZE / 2,
    Math.PI / CONSTRAINT_COMPOSITE_NODE_EDGES,
);

const resetConstraintCompositeScene = () => {
    const nodes = /** @type {BOM.BodyNode<any>[]} */(
        constraintCompositeScene.selectClass('composite-node')
    );
    nodes.forEach((node, index) => {
        const rowIndex = Math.floor(index / CONSTRAINT_COMPOSITE_COLUMNS);
        const columnIndex = index % CONSTRAINT_COMPOSITE_ROWS;
        node.velocity.set(0, 0);
        node.offset.set(
            CONSTRAINT_COMPOSITE_X0 + CONSTRAINT_COMPOSITE_NODE_SIZE * columnIndex,
            CONSTRAINT_COMPOSITE_Y0 + CONSTRAINT_COMPOSITE_NODE_SIZE * rowIndex,
        );
    });
};

const enterConstraintCompositeScene = () => {
    resetConstraintCompositeScene();
    enter(constraintCompositeScene);
};

const CompositeNode = () => (
    COM.create(BOM.BodyNode, {
        category: 'composite-node',
        classNames: ['composite-node'],
        vertices: CONSTRAINT_COMPOSITE_NODE_VERTICES,
        stiffness: 0.6,
        elasticity: 0.1,
        gravity: commonGravity,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    })
);

/**
 * @param {BOM.BodyNode<any>} bodyA
 * @param {BOM.BodyNode<any>} bodyB
 * @param {number} lengthScale
 * @returns {COM.CanvasNode<any>}
 */
const CompositeNodeConstraint = (bodyA, bodyB, lengthScale) => (
    new BOM.ConstraintNode({
        bodyA,
        bodyB,
        length: CONSTRAINT_COMPOSITE_NODE_SIZE * lengthScale,
        stiffness: 0.2,
        elasticity: 0.1,
        style: {
            strokeStyle: '#0C0',
        },
    })
);

const constraintCompositeScene = COM.create(BOM.WorldNode, {
    id: 'constraint-composite-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
});

/**
 * @type {BOM.BodyNode<any>[][]}
 */
const compositeNodes = [];
for (let rowIndex = 0; rowIndex < CONSTRAINT_COMPOSITE_ROWS; rowIndex++) {
    compositeNodes.push([]);
    for (let columnIndex = 0; columnIndex < CONSTRAINT_COMPOSITE_COLUMNS; columnIndex++) {
        const compositeNode = CompositeNode();
        compositeNodes[compositeNodes.length - 1].push(compositeNode);
        constraintCompositeScene.appendChild(
            /** @type {COM.CanvasNode<any>} */(compositeNode)
        );
    }
}

for (let rowIndex = 0; rowIndex < CONSTRAINT_COMPOSITE_ROWS; rowIndex++) {
    for (let columnIndex = 0; columnIndex < CONSTRAINT_COMPOSITE_COLUMNS; columnIndex++) {
        if (rowIndex > 0) {
            constraintCompositeScene.appendChild(
                CompositeNodeConstraint(
                    compositeNodes[rowIndex - 1][columnIndex],
                    compositeNodes[rowIndex][columnIndex],
                    1,
                )
            );
            if (columnIndex > 0) {
                constraintCompositeScene.appendChild(
                    CompositeNodeConstraint(
                        compositeNodes[rowIndex - 1][columnIndex - 1],
                        compositeNodes[rowIndex][columnIndex],
                        Math.SQRT2,
                    )
                );
            }
        }
        if (columnIndex > 0) {
            constraintCompositeScene.appendChild(
                CompositeNodeConstraint(
                    compositeNodes[rowIndex][columnIndex - 1],
                    compositeNodes[rowIndex][columnIndex],
                    1,
                )
            );
            if (rowIndex < CONSTRAINT_COMPOSITE_ROWS - 1) {
                constraintCompositeScene.appendChild(
                    CompositeNodeConstraint(
                        compositeNodes[rowIndex + 1][columnIndex - 1],
                        compositeNodes[rowIndex][columnIndex],
                        Math.SQRT2,
                    )
                );
            }
        }
    }
}

constraintCompositeScene.appendChild(
    /** @type {COM.CanvasNode<any>} */(
        COM.create(BOM.BodyNode, {
            category: 'ground',
            classNames: ['ground'],
            active: false,
            offsetX: 50,
            offsetY: 500,
            vertices: COM.Vertices.createRectangle(500, 60),
            elasticity: 0,
            interactive: true,
            draggable: true,
            style: {
                strokeStyle: '#F00',
            },
        }, [
            SimpleText('ground'),
        ])
    )
);

constraintCompositeScene.appendChild(
    /** @type {COM.CanvasNode<any>} */(
        ResetButton(resetConstraintCompositeScene)
    )
);
