// @ts-check
/// <reference path="./common.js" />

const resetConstraintBasicsScene = () => {
    const cradles = /** @type {POM.BodyNode<any>[]} */(
        constraintBasicsScene.selectClass('cradle')
    );
    cradles.forEach(cradle => {
        cradle.velocity.set(0, 0);
        cradle.offset.y = CRADLE_ANCHOR_Y;
    });
    cradles[0].offset.x = 0;
    cradles[1].offset.x = 350;
    ball0.velocity.set(0, 0);
    ball1.velocity.set(0, 0);
    ball2.velocity.set(0, 0);
    ball3.velocity.set(0, 0);
    ball0.offset.set(280, 50);
    ball1.offset.set(360, 100);
    ball2.offset.set(360, 50);
    ball3.offset.set(410, 100);
};

const enterConstraintBasicsScene = () => {
    resetConstraintBasicsScene();
    enter(constraintBasicsScene);
};

const ball0 = COM.create(POM.BodyNode, {
    category: 'ball',
    classNames: ['ball'],
    vertices: CRADLE_BALL_VERTICES,
    gravity: commonGravity,
    elasticity: 0.5,
    friction: 0,
    interactive: true,
    draggable: true,
    style: {
        strokeStyle: '#0F0',
    },
}, [
    SimpleText('ball0'),
]);

const ball1 = COM.create(POM.BodyNode, {
    category: 'ball',
    classNames: ['ball'],
    vertices: CRADLE_BALL_VERTICES,
    gravity: commonGravity,
    elasticity: 0.5,
    density: 2,
    friction: 0,
    interactive: true,
    draggable: true,
    style: {
        strokeStyle: '#0F0',
        lineWidth: 2,
    },
}, [
    SimpleText('ball1'),
]);

const ball2 = COM.create(POM.BodyNode, {
    category: 'ball',
    classNames: ['ball'],
    vertices: CRADLE_BALL_VERTICES,
    gravity: commonGravity,
    elasticity: 0.5,
    density: 2,
    friction: 0,
    interactive: true,
    draggable: true,
    style: {
        strokeStyle: '#00F',
        lineWidth: 2,
    },
}, [
    SimpleText('ball2'),
]);

const ball3 = COM.create(POM.BodyNode, {
    category: 'ball',
    classNames: ['ball'],
    vertices: CRADLE_BALL_VERTICES,
    gravity: commonGravity,
    elasticity: 0.5,
    friction: 0,
    interactive: true,
    draggable: true,
    style: {
        strokeStyle: '#00F',
    },
}, [
    SimpleText('ball3'),
]);

const constraintBasicsScene = COM.create(POM.WorldNode, {
    id: 'constraint-basics-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    ...createCradle({
        tag: 'cradle0',
        anchorX: 120,
        constraintOptions: {
            elasticity: 0,
            style: {
                strokeStyle: '#F00',
            },
        },
        ballOptions: {
            density: 2,
            elasticity: 0.5,
            style: {
                strokeStyle: '#C00',
                lineWidth: 2,
            },
        },
    }),

    ...createCradle({
        tag: 'cradle1',
        anchorX: 240,
        constraintOptions: {
            minLength: 0,
            elasticity: 0,
            style: {
                strokeStyle: '#FF0',
            },
        },
        ballOptions: {
            elasticity: 0.5,
            style: {
                strokeStyle: '#CC0',
            },
        },
    }),

    ball0,
    ball1,
    COM.create(POM.ConstraintNode, {
        bodyA: ball0,
        bodyB: ball1,
        minLength: 80,
        maxLength: 120,
        elasticity: 0.3,
        style: {
            strokeStyle: '#0C0',
        },
    }),

    ball2,
    ball3,
    COM.create(POM.ConstraintNode, {
        bodyA: ball2,
        bodyB: ball3,
        length: 100,
        style: {
            strokeStyle: '#00C',
        },
    }),

    COM.create(POM.BodyNode, {
        category: 'ground',
        classNames: ['ground'],
        active: false,
        offsetX: 50,
        offsetY: 500,
        vertices: COM.Vertices.createRectangle(500, 60),
        elasticity: 0.5,
        friction: 0,
        staticFriction: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('ground'),
    ]),

    COM.create(POM.BodyNode, {
        category: 'wall',
        classNames: ['wall'],
        active: false,
        offsetX: 500,
        offsetY: 200,
        vertices: COM.Vertices.createRectangle(50, 300),
        elasticity: 1,
        friction: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('wall'),
    ]),

    ResetButton(resetConstraintBasicsScene),

]);
