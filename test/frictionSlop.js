// @ts-check
/// <reference path="./common.js" />

const resetFrictionSlopeScene = () => {
    const items = /** @type {POM.BodyNode<any>[]} */(
        frictionSlopeScene.selectClass('item')
    );
    items.forEach(item => {
        item.velocity.set(0, 0);
    });
    items[0].offset.set(100, 100);
    items[1].offset.set(60, 160);
};

const enterFrictionSlopeScene = () => {
    resetFrictionSlopeScene();
    enter(frictionSlopeScene);
};

const frictionSlopeScene = COM.create(POM.WorldNode, {
    id: 'friction-slope-scene',
    stretch: 1,
    interactive: true,
    draggable: true,
    root,
}, [

    COM.create(POM.BodyNode, {
        category: 'item',
        classNames: ['item'],
        vertices: COM.Vertices.createRectangle(60, 60),
        gravity: commonGravity,
        elasticity: 0.1,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    }, [
        SimpleText('item0'),
    ]),

    COM.create(POM.BodyNode, {
        category: 'item',
        classNames: ['item'],
        vertices: COM.Vertices.fromArray([
            0, 0,
            100, 0,
            100, 100,
        ]),
        gravity: commonGravity,
        elasticity: 0.1,
        interactive: true,
        draggable: true,
        style: {
            strokeStyle: '#0F0',
        },
    }, [
        SimpleText('item1', {
            textAlign: 'right',
            textBaseline: 'top',
        }),
    ]),

    COM.create(POM.BodyNode, {
        category: 'slope',
        classNames: ['slope'],
        active: false,
        offsetX: 50,
        offsetY: 300,
        vertices: COM.Vertices.fromArray([
            0, 0,
            200, 200,
            0, 200,
        ]),
        elasticity: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('slope', {
            textAlign: 'left',
            textBaseline: 'bottom',
        }),
    ]),

    COM.create(POM.BodyNode, {
        category: 'ground',
        classNames: ['ground'],
        active: false,
        offsetX: 50,
        offsetY: 500,
        vertices: COM.Vertices.createRectangle(500, 60),
        elasticity: 0,
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
        offsetY: 250,
        vertices: COM.Vertices.createRectangle(50, 250),
        elasticity: 1,
        friction: 0,
        staticFriction: 0,
        style: {
            strokeStyle: '#F00',
        },
    }, [
        SimpleText('wall'),
    ]),

    ResetButton(resetFrictionSlopeScene),

]);
