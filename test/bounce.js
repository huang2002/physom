// @ts-check
/// <reference path="./common.js" />

const BOUNCE_BOX_VERTICES = COM.Vertices.createRectangle(60, 60);

const resetBounceScene = () => {
    const boxes = /** @type {BOM.BodyNode<any>[]} */(
        bounceScene.selectClass('box')
    );
    boxes.forEach(box => {
        box.velocity.set(0, 0);
    });
    boxes[0].offset.set(100, 200);
    boxes[1].offset.set(175, 200);
    boxes[2].offset.set(250, 0);
    boxes[3].offset.set(325, 0);
    boxes[4].offset.set(400, 100);
};

const enterBounceScene = () => {
    resetBounceScene();
    enter(bounceScene);
};

/**
 * @param {string} tag
 * @param {number} [elasticity]
 */
const BounceBox = (tag, elasticity) => (
    COM.create(BOM.BodyNode, {
        category: 'box',
        classNames: ['box'],
        vertices: BOUNCE_BOX_VERTICES,
        gravity: commonGravity,
        elasticity,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    }, [
        SimpleText(tag),
    ])
);

const bounceScene = COM.create(BOM.WorldNode, {
    id: 'bounce-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    BounceBox('box0', 0),
    BounceBox('box1'),
    BounceBox('box2'),
    BounceBox('box3', 0.5),
    BounceBox('box4', 0.98),

    COM.create(BOM.BodyNode, {
        category: 'ground',
        classNames: ['ground'],
        active: false,
        offsetX: 50,
        offsetY: 500,
        vertices: COM.Vertices.createRectangle(450, 60),
        elasticity: 0,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('ground'),
    ]),

    ResetButton(resetBounceScene),

]);
