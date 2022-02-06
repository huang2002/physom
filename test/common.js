// @ts-check
/// <reference types="canvasom" />
/// <reference types=".." />
/// <reference path="./index.js" />

const MENU_CONTAINER_WIDTH = 200;

const CRADLE_ANCHOR_Y = 250;
const CRADLE_INIT_LENGTH = 210;
const CRADLE_BALL_EDGES = 16;
const CRADLE_BALL_RADIUS = 30;
const CRADLE_BALL_VERTICES = COM.Vertices.createRegularPolygon(
    CRADLE_BALL_EDGES,
    CRADLE_BALL_RADIUS,
    Math.PI / CRADLE_BALL_EDGES,
);

const commonGravity = new COM.Vector(0, 0.1);

const canvas = /** @type {HTMLCanvasElement} */(
    document.getElementById('canvas')
);

const renderer = new COM.Renderer({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
});

const root = new COM.CanvasRoot({
    renderer,
    interactive: true,
    style: {
        font: '16px sans-serif',
    },
});

const menuContainer = new COM.RectNode({
    boundsWidth: MENU_CONTAINER_WIDTH,
    stretchY: 1,
    interactive: true,
    smartSize: true,
    style: {
        fillStyle: '#EEE',
        shadowColor: '#999',
        shadowBlur: 10,
    },
});
root.appendChild(menuContainer);

const sceneContainer = new COM.RectNode({
    offsetX: MENU_CONTAINER_WIDTH,
    boundsWidth: root.width - MENU_CONTAINER_WIDTH,
    stretchY: 1,
    interactive: true,
    clipContent: true,
    smartSize: true,
});
root.appendChild(sceneContainer);

const resizeRenderer = () => {
    renderer.resize(
        window.innerWidth,
        window.innerHeight,
    );
    sceneContainer.bounds.width = root.width - MENU_CONTAINER_WIDTH;
    root.updateAndRender();
};

window.addEventListener('resize', resizeRenderer);
window.addEventListener('orientationchange', resizeRenderer);

/**
 * @param {POM.WorldNode<any>} nextScene
 */
const enter = (nextScene) => {
    if (sceneContainer.childNodes.length) {
        const previousScene = /** @type {POM.WorldNode<any>} */(
            sceneContainer.childNodes[0]
        );
        if (previousScene === nextScene) {
            return;
        }
        previousScene.deactivate();
        sceneContainer.replaceChild(
            /** @type {COM.CanvasNode<any>} */(previousScene),
            /** @type {COM.CanvasNode<any>} */(nextScene),
        );
    } else {
        sceneContainer.appendChild(
            /** @type {COM.CanvasNode<any>} */(nextScene)
        );
    }
    nextScene.activate();
    root.updateAndRender();
};

/**
 * @param {string} content
 * @param {Partial<COM.CanvasStyle>} [style]
 * @returns {COM.CanvasNode<any>}
 */
const SimpleText = (content, style) => (
    COM.create(COM.TextNode, {
        content,
        stretch: 1,
        style: {
            fillStyle: '#000',
            textAlign: 'center',
            textBaseline: 'middle',
            ...style,
        },
    })
);

/**
 * @param {COM.EventListener<COM.CanvasPointerEvent>} [callback]
 */
const ResetButton = (callback) => (
    COM.create(COM.RectNode, {
        offsetX: 50,
        offsetY: 50,
        width: 120,
        height: 50,
        radius: 6,
        interactive: true,
        style: {
            fillStyle: '#FFF',
            strokeStyle: '#111',
        },
        listeners: {
            click: callback,
        },
    }, [
        SimpleText('reset'),
    ])
);

/**
 * @typedef CreateCradleOptions
 * @property {string} tag
 * @property {number} anchorX
 * @property {POM.ConstraintNodeOptions<any>} [constraintOptions]
 * @property {POM.BodyNodeOptions<any>} [ballOptions]
 */

/**
 * @param {CreateCradleOptions} options
 * @returns {(POM.BodyNode | POM.ConstraintNode)[]}
 */
const createCradle = (options) => {

    const anchor = POM.Utils.createAnchor(options.anchorX, CRADLE_ANCHOR_Y);
    anchor.classNames.push('anchor');

    const ball = COM.create(POM.BodyNode, {
        category: 'cradle',
        classNames: ['cradle'],
        vertices: CRADLE_BALL_VERTICES,
        gravity: commonGravity,
        friction: 0,
        interactive: true,
        draggable: true,
        ...options.ballOptions,
    }, [
        SimpleText(options.tag),
    ]);

    const constraint = COM.create(POM.ConstraintNode, {
        bodyA: anchor,
        bodyB: ball,
        length: CRADLE_INIT_LENGTH,
        ...options.constraintOptions,
    });

    return [ball, constraint];

};
