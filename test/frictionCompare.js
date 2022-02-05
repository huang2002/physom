// @ts-check
/// <reference path="./common.js" />

const resetFrictionCompareScene = () => {
    const items = /** @type {BOM.BodyNode<any>[]} */(
        frictionCompareScene.selectClass('item')
    );
    items.forEach(item => {
        item.velocity.set(4, 0);
    });
    items[0].offset.set(110, 90);
    items[1].offset.set(110, 210);
    items[2].offset.set(110, 330);
    items[3].offset.set(110, 450);
};

const enterFrictionCompareScene = () => {
    resetFrictionCompareScene();
    enter(frictionCompareScene);
};

/**
 * @typedef FrictionItemOptions
 * @property {number} [friction]
 * @property {number} [staticFriction]
 */

/**
 * @param {FrictionItemOptions} [options]
 */
const FrictionItem = (options) => {
    const item = COM.create(BOM.BodyNode, {
        category: 'item',
        classNames: ['item'],
        vertices: COM.Vertices.createRectangle(80, 50),
        elasticity: 0,
        friction: options?.friction,
        staticFriction: options?.staticFriction,
        gravity: commonGravity,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    });
    item.appendChild(
        SimpleText(`${item.friction} ${item.staticFriction}`)
    );
    return item;
};

/**
 * @typedef FrictionGroundOptions
 * @property {number} [friction]
 * @property {number} [staticFriction]
 * @property {number} x
 * @property {number} y
 */

/**
 * @param {FrictionGroundOptions} options
 */
const FrictionGround = (options) => {
    const ground = COM.create(BOM.BodyNode, {
        category: 'ground',
        classNames: ['ground'],
        active: false,
        offsetX: options.x,
        offsetY: options.y,
        vertices: COM.Vertices.createRectangle(400, 50),
        elasticity: 0,
        friction: options.friction,
        staticFriction: options.staticFriction,
        style: {
            strokeStyle: '#F00',
        },
    });
    ground.appendChild(
        SimpleText(
            `friction: ${ground.friction}; staticFriction: ${ground.staticFriction}`
        )
    );
    return ground;
};

const frictionCompareScene = COM.create(BOM.WorldNode, {
    id: 'friction-compare-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    FrictionItem(),
    FrictionGround({
        x: 100,
        y: 150,
    }),

    FrictionItem({
        friction: 0.2,
        staticFriction: 0.3,
    }),
    FrictionGround({
        x: 100,
        y: 270,
        friction: 0.2,
        staticFriction: 0.3,
    }),

    FrictionItem(),
    FrictionGround({
        friction: 0,
        staticFriction: 0,
        x: 100,
        y: 390,
    }),

    FrictionItem({
        friction: 0,
        staticFriction: 0,
    }),
    FrictionGround({
        x: 100,
        y: 510,
    }),

    COM.create(BOM.BodyNode, {
        category: 'wall',
        classNames: ['wall'],
        active: false,
        offsetX: 50,
        offsetY: 80,
        vertices: COM.Vertices.createRectangle(50, 480),
        elasticity: 1,
        friction: 0,
        staticFriction: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('>>'),
    ]),

    COM.create(BOM.BodyNode, {
        category: 'wall',
        classNames: ['wall'],
        active: false,
        offsetX: 500,
        offsetY: 80,
        vertices: COM.Vertices.createRectangle(50, 480),
        elasticity: 1,
        friction: 0,
        staticFriction: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('<<'),
    ]),

    ResetButton(resetFrictionCompareScene),

]);
