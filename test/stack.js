// @ts-check
/// <reference path="./common.js" />

const STACK_BOX_VERTICES = COM.Vertices.createRectangle(60, 60);

const resetStackScene = () => {
    const boxes = /** @type {POM.BodyNode<any>[]} */(
        stackScene.selectClass('box')
    );
    boxes.forEach((box, i) => {
        box.velocity.set(0, 0);
    });
    boxes[0].offset.set(160, 50);
    boxes[1].offset.set(130, 200);
    boxes[2].offset.set(190, 200);
    boxes[3].offset.set(100, 350);
    boxes[4].offset.set(160, 350);
    boxes[5].offset.set(220, 350);
    boxes[6].offset.set(390, 50);
    boxes[7].offset.set(390, 200);
    boxes[8].offset.set(390, 350);
};

const enterStackScene = () => {
    resetStackScene();
    enter(stackScene);
};

/**
 * @param {number} index
 */
const StackBox = (index) => (
    COM.create(POM.BodyNode, {
        category: 'box',
        classNames: ['box'],
        vertices: STACK_BOX_VERTICES,
        stiffness: 0.6,
        elasticity: 0,
        gravity: commonGravity,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    }, [
        SimpleText(`box${index}`),
    ])
);

const stackScene = COM.create(POM.WorldNode, {
    id: 'stack-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    ...Array.from(
        { length: 9 },
        (_, i) => (
            StackBox(i)
        ),
    ),

    COM.create(POM.BodyNode, {
        category: 'ground',
        classNames: ['ground'],
        active: false,
        offsetX: 50,
        offsetY: 500,
        vertices: COM.Vertices.createRectangle(450, 60),
        elasticity: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('ground'),
    ]),

    ResetButton(resetStackScene),

]);
