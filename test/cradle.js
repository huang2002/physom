// @ts-check
/// <reference path="./common.js" />

const CRADLE_SCENE_X0 = 200;

const resetCradleScene = () => {
    const cradles = /** @type {BOM.BodyNode<any>[]} */(
        cradleScene.selectClass('cradle')
    );
    cradles.forEach((cradle, i) => {
        cradle.velocity.set(0, 0);
        if (i) {
            cradle.offset.set(
                CRADLE_SCENE_X0 + CRADLE_BALL_RADIUS * (2 * i - 1),
                CRADLE_ANCHOR_Y + CRADLE_INIT_LENGTH - CRADLE_BALL_RADIUS,
            );
        } else {
            cradle.offset.set(
                CRADLE_SCENE_X0 - CRADLE_INIT_LENGTH,
                CRADLE_ANCHOR_Y - CRADLE_BALL_RADIUS,
            );
        }
    });
};

const enterCradleScene = () => {
    resetCradleScene();
    enter(cradleScene);
};

const cradleScene = COM.create(BOM.WorldNode, {
    id: 'cradle-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    ...([0, 1, 2, 3, 4].flatMap(i => (
        createCradle({
            tag: `cradle${i}`,
            anchorX: CRADLE_SCENE_X0 + CRADLE_BALL_RADIUS * 2 * i,
            constraintOptions: {
                stiffness: 1,
                elasticity: 0,
                style: {
                    strokeStyle: '#0F0',
                },
            },
            ballOptions: {
                stiffness: 1,
                elasticity: 1,
                style: {
                    strokeStyle: '#0C0',
                },
            },
        })
    ))),

    ResetButton(resetCradleScene),

]);
