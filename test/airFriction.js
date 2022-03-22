// @ts-check
/// <reference path="./common.js" />

const AIR_FRICTION_BALL_VERTICES = COM.Vertices.createRegularPolygon(20, 50);

const resetAirFrictionScene = () => {
    const balls = /** @type {POM.BodyNode<any>[]} */(
        airFrictionScene.selectClass('ball')
    );
    balls.forEach(ball => {
        ball.velocity.set(0, 0);
    });
    balls[0].offset.set(200, 200);
    balls[1].offset.set(400, 200);
    balls[2].offset.set(200, 400);
    balls[3].offset.set(400, 400);
};

const enterAirFrictionScene = () => {
    resetAirFrictionScene();
    enter(airFrictionScene);
};

/**
 * @param {number} [airFriction]
 */
const AirFrictionBall = (airFriction) => (
    COM.create(POM.BodyNode, {
        category: 'ball',
        classNames: ['ball'],
        vertices: AIR_FRICTION_BALL_VERTICES,
        airFriction,
        elasticity: 0.5,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    }, [
        SimpleText(
            (airFriction ?? 0).toFixed(3)
        ),
    ])
);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
const AirFrictionBoundary = (x, y, width, height) => (
    COM.create(POM.BodyNode, {
        category: 'boundary',
        classNames: ['boundary'],
        active: false,
        offsetX: x,
        offsetY: y,
        vertices: COM.Vertices.createRectangle(width, height),
        elasticity: 0.5,
        style: {
            strokeStyle: '#F00',
        },
    })
);

const airFrictionScene = COM.create(POM.WorldNode, {
    id: 'airFriction-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    AirFrictionBoundary(50, 50, 50, 550),
    AirFrictionBoundary(50, 600, 550, 50),
    AirFrictionBoundary(100, 50, 550, 50),
    AirFrictionBoundary(600, 100, 50, 550),

    AirFrictionBall(),
    AirFrictionBall(0.005),
    AirFrictionBall(0.020),
    AirFrictionBall(0.100),

    ResetButton(resetAirFrictionScene),

]);
