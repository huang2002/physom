// @ts-check
/// <reference path="./common.js" />
/// <reference path="./bounce.js" />
/// <reference path="./stack.js" />
/// <reference path="./frictionSlop.js" />
/// <reference path="./frictionCompare.js" />
/// <reference path="./constraintBasics.js" />
/// <reference path="./constraintCloth.js" />
/// <reference path="./constraintComposite.js" />
/// <reference path="./cradle.js" />

/**
 * @param {string} text
 * @param {COM.EventListener<COM.CanvasPointerEvent>} callback
 */
const MenuButton = (text, callback) => (
    COM.create(COM.RectNode, {
        boundsHeight: 40,
        stretchX: 1,
        smartSize: true,
        radius: 6,
        interactive: true,
        listeners: {
            click: callback,
        },
        style: {
            fillStyle: '#FFF',
            strokeStyle: '#111',
        },
    }, [
        SimpleText(text),
    ])
);

const menus = COM.create(COM.AlignNode, {
    stretch: 1,
    alignX: 'center',
}, [
    COM.create(COM.FlowNode, {
        offsetY: 20,
        stretchX: 0.85,
        stretchY: 1,
        direction: 'y',
        gap: 10,
    }, [
        COM.create(COM.TextNode, {
            content: 'Tests:',
            boundsHeight: 50,
            stretchX: 1,
            style: {
                fillStyle: '#000',
                font: 'bold 25px sans-serif',
                textAlign: 'center',
                textBaseline: 'middle',
            },
        }),
        MenuButton('bounce', () => {
            enterBounceScene();
        }),
        MenuButton('stack', () => {
            enterStackScene();
        }),
        MenuButton('friction-slope', () => {
            enterFrictionSlopeScene();
        }),
        MenuButton('friction-compare', () => {
            enterFrictionCompareScene();
        }),
        MenuButton('constraint-basics', () => {
            enterConstraintBasicsScene();
        }),
        MenuButton('constraint-cloth', () => {
            enterConstraintClothScene();
        }),
        MenuButton('constraint-composite', () => {
            enterConstraintCompositeScene();
        }),
        MenuButton('cradle', () => {
            enterCradleScene();
        }),
    ]),
]);

menuContainer.appendChild(menus);
root.updateAndRender();
