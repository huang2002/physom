import { CanvasNodeEvents, CanvasNode, CanvasNodeOptions, Schedule, Utils as COMUtils, CanvasRoot, Event, CanvasPointerStartEvent, CanvasPointerMoveEvent, CanvasPointerEndEvent } from "canvasom";
import type { BodyNode, BodyNodeDragEndEvent, BodyNodeDragMoveEvent, BodyNodeDragStartEvent } from './BodyNode';
import { Collision, CollisionChecker } from './Collision';
import { ConstraintNode } from './Constraint';
import { Utils } from './Utils';

/**
 * Emits before main loop.
 * (stoppable &cancelable;
 * Invoke `event.cancel` to skip main loop.)
 */
export type WorldBeforeUpdateEvent = Event<'beforeUpdate', null>;
/** dts2md break */
/**
 * Emits after main loop. (stoppable)
 */
export type WorldAfterUpdateEvent = Event<'afterUpdate', null>;
/** dts2md break */
/**
 * Type map of events on world nodes.
 */
export interface WorldNodeEvents extends CanvasNodeEvents {
    beforeUpdate: WorldBeforeUpdateEvent;
    afterUpdate: WorldAfterUpdateEvent;
}
/** dts2md break */
/**
 * Type of options for {@link WorldNode}.
 */
export type WorldNodeOptions<Events extends WorldNodeEvents> = (
    & CanvasNodeOptions<Events>
    & Partial<{
        /**
         * The duration of a frame. (ms)
         * @default 10
         */
        frameDuration: number;
        /**
         * The maximum count of frames that an update can have.
         * @default 3
         */
        maxFrameCount: number;
        /**
         * Default value of `renderRoot`.
         * @default this.getRoot()
         */
        root: CanvasRoot<any> | null;
        /**
         * The root node that should be automatically rerendered.
         * (Set this to `null` to disable automatic rerender.)
         * @default options.root
         */
        renderRoot: CanvasRoot<any> | null;
        /**
         * The root node to which event listeners are attached.
         * (Set this to `null` to disable default event handling.)
         * @default options.root
         */
        eventRoot: CanvasRoot<any> | null;
        /**
         * The collision checker to use.
         * (Set this to `null` to disable collision checking.)
         * @default Collision.Checkers.SAT
         */
        collisionChecker: CollisionChecker | null;
        /**
         * Wether to enable built-in drag handling.
         * @default false
         */
        draggable: boolean;
    }>
);
/** dts2md break */
/**
 * Class of physical world nodes
 * that contain and update body nodes.
 */
export class WorldNode<Events extends WorldNodeEvents = WorldNodeEvents>
    extends CanvasNode<Events> {
    /** dts2md break */
    /**
     * Constructor of {@link WorldNode}.
     */
    constructor(options?: WorldNodeOptions<Events>) {

        super(options);

        const defaultRoot = (options?.root !== undefined)
            ? options.root
            : this.getRoot();

        this.eventRoot = (options?.eventRoot !== undefined)
            ? options.eventRoot
            : defaultRoot;
        this.frameDuration = options?.frameDuration ?? 10;
        this.maxFrameCount = options?.maxFrameCount ?? 3;
        this.renderRoot = (options?.renderRoot !== undefined)
            ? options.renderRoot
            : defaultRoot;
        this.collisionChecker = options?.collisionChecker ?? Collision.Checkers.SAT;
        this.draggable = options?.draggable ?? false;

        this._onPointerStart = this._onPointerStart.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerEnd = this._onPointerEnd.bind(this);

        this.pointerConstraint = new ConstraintNode({
            bodyA: Utils.createAnchor(0, 0),
            length: 0,
            stiffness: 0.5,
            elasticity: 0.2,
        });

        this.attachListeners();

    }
    /** dts2md break */
    /**
     * @override CanvasNode.tag
     * @default 'world'
     */
    readonly tag: string = 'world';
    /** dts2md break */
    /**
     * The root node to which event listeners are attached.
     * (Set this to `null` to disable default event handling.)
     * @default options.root
     */
    readonly eventRoot: CanvasRoot<any> | null;
    /** dts2md break */
    /**
     * The internal pointer constraint.
     * (The `bodyA` is initialized with an anchor body
     * which automatically follows the pointer,
     * and the `bodyB` will be the object being dragged.)
     */
    readonly pointerConstraint: ConstraintNode;
    /** dts2md break */
    /**
     * @override CanvasNode.penetrable
     * @default true
     */
    penetrable = true;
    /** dts2md break */
    /**
     * The duration of a frame. (ms)
     * @default 10
     */
    frameDuration: number;
    /** dts2md break */
    /**
     * The maximum count of frames that an update can have.
     * @default 3
     */
    maxFrameCount: number;
    /** dts2md break */
    /**
     * The root node that should be automatically rerendered.
     * (Set this to `null` to disable automatic rerender.)
     * @default options.root
     */
    renderRoot: CanvasRoot<any> | null;
    /** dts2md break */
    /**
     * The collision checker to use.
     * (Set this to `null` to disable collision checking.)
     * @default Collision.Checkers.SAT
     */
    collisionChecker: CollisionChecker | null;
    /** dts2md break */
    /**
     * Wether to enable built-in drag handling.
     * @default false
     */
    draggable: boolean;
    /** dts2md break */
    /**
     * @override CanvasNode.noChildUpdate
     * @default true
     */
    protected noChildUpdate = true;

    private _active = false;
    private _lastUpdateTime: number | null = null;
    private _savedTime = 0;
    /** dts2md break */
    /**
     * Whether the world is active now.
     */
    get active() {
        return this._active;
    }
    /** dts2md break */
    /**
     * Activate the world node.
     */
    activate() {
        if (this._active) {
            return;
        }
        Schedule.update(this);
        this._active = true;
    }
    /** dts2md break */
    /**
     * Deactivate the world node.
     */
    deactivate() {

        if (!this._active) {
            return;
        }

        this._active = false;
        this._lastUpdateTime = null;
        Schedule.cancelUpdate(this);

        const { pointerConstraint } = this;
        const { bodyB } = pointerConstraint;
        if (bodyB) {
            const { bodyA } = pointerConstraint;
            const { offset: offsetA } = bodyA!;
            const dragEndEvent: BodyNodeDragEndEvent = new Event({
                name: 'dragend',
                stoppable: true,
                data: {
                    id: null,
                    x: offsetA.x,
                    y: offsetA.y,
                    rawEvent: null,
                },
            });
            bodyB.emit(dragEndEvent);
            pointerConstraint.bodyB = null;
        }

    }

    private _onPointerStart(event: CanvasPointerStartEvent) {

        if (!this.draggable || !this.interactive || !this._active) {
            return;
        }

        const { data } = event;
        const { target } = data;
        if ((target.tag !== 'body') || !(target as BodyNode).draggable) {
            return;
        }

        const { pointerConstraint } = this;
        const { bodyB } = pointerConstraint;
        const x = data.x - this.x;
        const y = data.y - this.y;

        pointerConstraint.bodyA!.offset.set(x, y);

        const dragStartEvent: BodyNodeDragStartEvent = new Event({
            name: 'dragstart',
            stoppable: true,
            cancelable: true,
            data: {
                id: data.id,
                x,
                y,
                rawEvent: data.rawEvent,
            },
        });

        target.emit(dragStartEvent);
        if (dragStartEvent.canceled) {
            return;
        }

        if (bodyB) {
            const dragEndEvent: BodyNodeDragEndEvent = new Event({
                name: 'dragend',
                stoppable: true,
                data: {
                    id: data.id,
                    x,
                    y,
                    rawEvent: data.rawEvent,
                },
            });
            bodyB.emit(dragEndEvent);
        }

        pointerConstraint.bodyB = target as BodyNode;
        pointerConstraint.anchorB.set(
            data.x - target.x,
            data.y - target.y,
        );

    }

    private _onPointerMove(event: CanvasPointerMoveEvent) {

        if (!this.draggable || !this.interactive || !this._active) {
            return;
        }

        const { pointerConstraint } = this;
        const { bodyA, bodyB } = pointerConstraint;
        const { data } = event;
        const x = data.x - this.x;
        const y = data.y - this.y;

        if (!bodyB) {
            return;
        }

        const dragMoveEvent: BodyNodeDragMoveEvent = new Event({
            name: 'dragmove',
            stoppable: true,
            cancelable: true,
            data: {
                id: data.id,
                x,
                y,
                rawEvent: data.rawEvent,
            },
        });

        bodyB.emit(dragMoveEvent);

        if (!dragMoveEvent.canceled) {
            bodyA!.offset.set(x, y);
        }

    }

    private _onPointerEnd(event: CanvasPointerEndEvent) {

        const { pointerConstraint } = this;
        const { bodyB } = pointerConstraint;
        const { data } = event;
        const x = data.x - this.x;
        const y = data.y - this.y;

        pointerConstraint.bodyA!.offset.set(x, y);

        if (bodyB) {
            const dragEndEvent: BodyNodeDragEndEvent = new Event({
                name: 'dragend',
                stoppable: true,
                data: {
                    id: data.id,
                    x,
                    y,
                    rawEvent: data.rawEvent,
                },
            });
            bodyB.emit(dragEndEvent);
            pointerConstraint.updateSync(event.timeStamp);
        }

        pointerConstraint.bodyB = null;

    }

    private _listenerAttached = false;
    /** dts2md break */
    /**
     * Attach event listeners.
     * (This will be automatically invoked in constructor.)
     */
    attachListeners() {
        if (this._listenerAttached) {
            return;
        }
        const { eventRoot } = this;
        if (eventRoot) {
            eventRoot.addListener('pointerstart', this._onPointerStart);
            eventRoot.addListener('pointermove', this._onPointerMove);
            eventRoot.addListener('pointerend', this._onPointerEnd);
            this._listenerAttached = true;
        }
    }
    /** dts2md break */
    /**
     * Detach event listeners.
     */
    detachListeners() {
        if (!this._listenerAttached) {
            return;
        }
        const { eventRoot } = this;
        if (eventRoot) {
            eventRoot.removeListener('pointerstart', this._onPointerStart);
            eventRoot.removeListener('pointermove', this._onPointerMove);
            eventRoot.removeListener('pointerend', this._onPointerEnd);
            this._listenerAttached = false;
        }
    }
    /** dts2md break */
    /**
     * @override CanvasNode.updateLayout
     */
    protected updateLayout(timeStamp: number) {

        if (!this._active) {
            this._lastUpdateTime = null;
            return;
        }

        let frameCount = 0;

        // update frame info
        const { _lastUpdateTime } = this;
        if (_lastUpdateTime === null) {
            frameCount = 1;
            this._savedTime = 0;
        } else {
            const { frameDuration } = this;
            const deltaTime = timeStamp - _lastUpdateTime + this._savedTime;
            frameCount = Math.min(
                this.maxFrameCount,
                Math.floor(deltaTime / frameDuration),
            );
            this._savedTime = deltaTime - frameCount * frameDuration;
        }

        // before update
        const beforeUpdateEvent: WorldBeforeUpdateEvent = new Event({
            name: 'beforeUpdate',
            stoppable: true,
            cancelable: true,
            data: null,
        });
        this.emit(beforeUpdateEvent as unknown as COMUtils.ValueType<Events>);

        const { childNodes, collisionChecker, pointerConstraint } = this;
        const bodies = this.selectTag('body') as BodyNode<any>[];
        const constraints = this.selectTag('constraint') as ConstraintNode<any>[];
        const collidableBodies = bodies.filter(
            body => (body.category && body.collisionFilter)
        );

        // main loop
        for (let i = 0; i < frameCount; i++) {
            // reset
            bodies.forEach(body => {
                body.contacts.clear();
                body.impulse.set(0, 0);
            });
            // update pointer constraint
            pointerConstraint.updateSync(timeStamp);
            // check collision
            if (collisionChecker) {
                Collision.findAndHandle(collidableBodies, collisionChecker);
            }
            // update constraints
            constraints.forEach(constraint => {
                constraint.updateSync(timeStamp);
            });
            // update bodies
            childNodes.forEach(childNode => {
                childNode.updateSync(timeStamp);
            });
        }

        // after update
        const afterUpdateEvent: WorldAfterUpdateEvent = new Event({
            name: 'afterUpdate',
            stoppable: true,
            data: null,
        });
        this.emit(afterUpdateEvent as unknown as COMUtils.ValueType<Events>);

        // rerender
        const { renderRoot: root } = this;
        if (root) {
            Schedule.render(root);
        }

    }
    /** dts2md break */
    /**
     * @override CanvasNode.afterUpdate
     */
    protected afterUpdate(timeStamp: number) {
        if (this._active) {
            Schedule.update(this);
        }
    }

}
