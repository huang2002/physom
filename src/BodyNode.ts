import { CanvasNodeEvents, PolygonNode, PolygonNodeOptions, Vector, Event, VectorLike } from "canvasom";
import { Category, CategoryTag } from './Category';
import { CollisionInfo } from './Collision';

/**
 * Type of projection result.
 */
export interface Projection {
    min: number;
    max: number;
}
/** dts2md break */
/**
 * Type of data of collision events.
 */
export interface BodyNodeCollisionEventData extends CollisionInfo {
    /**
     * The other body that collides with this one.
     */
    target: BodyNode;
}
/** dts2md break */
/**
 * Emits on collision.
 * (stoppable & cancelable;
 * Invoke `event.cancel` to prevent default handling.)
 */
export type BodyNodeCollisionEvent = Event<'collision', BodyNodeCollisionEventData>;
/** dts2md break */
/**
 * Type of data of drag events.
 */
export interface BodyNodeDragEventData {
    /**
     * Pointer identity.
     * (Not available when the event is triggered from other sources.)
     */
    id: number | null;
    /**
     * Pointer x.
     * (Relative to the world node that handles the drag.)
     */
    x: number;
    /**
     * Pointer y.
     * (Relative to the world node that handles the drag.)
     */
    y: number;
    /**
     * The original DOM event.
     * (Not available when the event is triggered from other sources.)
     */
    rawEvent: MouseEvent | TouchEvent | null;
}
/** dts2md break */
/**
 * Emits when drag starts. (stoppable & cancelable)
 */
export type BodyNodeDragStartEvent = Event<'dragstart', BodyNodeDragEventData>;
/** dts2md break */
/**
 * Emits on dragging. (stoppable & cancelable)
 */
export type BodyNodeDragMoveEvent = Event<'dragmove', BodyNodeDragEventData>;
/** dts2md break */
/**
 * Emits when drag ends. (stoppable)
 */
export type BodyNodeDragEndEvent = Event<'dragend', BodyNodeDragEventData>;
/** dts2md break */
/**
 * Type of events on {@link BodyNode}.
 */
export interface BodyNodeEvents extends CanvasNodeEvents {
    collision: BodyNodeCollisionEvent;
    dragstart: BodyNodeDragStartEvent;
    dragmove: BodyNodeDragMoveEvent;
    dragend: BodyNodeDragEndEvent;
}
/** dts2md break */
/**
 * Type of options for {@link BodyNode}.
 */
export type BodyNodeOptions<Events extends BodyNodeEvents> = (
    & PolygonNodeOptions<Events>
    & Partial<{
        /**
         * Whether the object is active. (not static)
         * @default true
         */
        active: boolean;
        /**
         * Whether the object is draggable.
         * (Drag is handled by `WorldNode`.)
         * @default false
         */
        draggable: boolean;
        /**
         * The category of the object.
         * (`Category.for` will be invoked
         * to get the actual category
         * if the input is not a number.)
         * @default 0
         */
        category: number | CategoryTag;
        /**
         * The collision filter of the object.
         * @default Category.FULL_MASK
         */
        collisionFilter: number;
        /**
         * The sensor filter of the object.
         * @default 0
         */
        sensorFilter: number;
        /**
         * The velocity of the object.
         */
        velocity: Vector;
        /**
         * The accelaration of the object.
         */
        accelaration: Vector;
        /**
         * The gravity of the object.
         * @default null
         */
        gravity: Vector | null;
        /**
         * The stiffness of the object. (0~1)
         * @default 0.95
         */
        stiffness: number;
        /**
         * The elasticity of the object.
         * @default 0.3
         */
        elasticity: number;
        /**
         * The friction coefficient of the object.
         * @default 0.3
         */
        friction: number;
        /**
         * The static friction coefficient of the object.
         * @default 0.4
         */
        staticFriction: number;
        /**
         * The density of the object.
         * (This affects the mass of the object.)
         * @default 1
         */
        density: number;
        /**
         * The mass of the object.
         * (This affects the density of the object.)
         * @default area * density
         */
        mass: number;
        /**
         * The acceptable amount of overlap.
         * @default 0.1
         */
        slop: number;
        /**
         * Whether the vertices are placed clockwise.
         * (mathematically, not on canvas)
         * @default true
         */
        clockwise: boolean;
        /**
         * The precision(fraction digits) of tangent values of normal vectors.
         * (This helps reduce similar normal vectors.)
         * @default 6
         */
        normalPrecision: number;
    }>
);
/** dts2md break */
/**
 * Class of rigid bodies.
 */
export class BodyNode<Events extends BodyNodeEvents = BodyNodeEvents>
    extends PolygonNode<Events> {
    /** dts2md break */
    /**
     * The maximum speed that an object is considered static.
     * @default 0.02
     */
    static maxStaticSpeed = 0.02;
    /** dts2md break */
    /**
     * Constructor of {@link BodyNode}.
     */
    constructor(options?: BodyNodeOptions<Events>) {
        super(options);
        this.active = options?.active ?? true;
        this.draggable = options?.draggable ?? false;
        this.velocity = options?.velocity ?? new Vector();
        this.accelaration = options?.accelaration ?? new Vector();
        this.gravity = options?.gravity ?? null;
        this.stiffness = options?.stiffness ?? 0.95;
        this.elasticity = options?.elasticity ?? 0.3;
        this.friction = options?.friction ?? 0.3;
        this.staticFriction = options?.staticFriction ?? 0.4;
        this._density = options?.density ?? 1;
        this.slop = options?.slop ?? 0.1;
        this.clockwise = options?.clockwise ?? true;
        this.collisionFilter = options?.collisionFilter ?? Category.FULL_MASK;
        this.sensorFilter = options?.sensorFilter ?? 0;
        this.normalPrecision = options?.normalPrecision ?? 6;
        this.offset.set(this.offsetX, this.offsetY);
        if (options?.category == null) { // undefined or null
            this.category = 0;
        } else {
            if (typeof options.category === 'number') {
                this.category = options.category;
            } else {
                this.category = Category.for(options.category);
            }
        }
        if (options?.vertices) {
            // `super.updateVertices` has been invoked in `super`.
            this._updateVertices(options.vertices);
        } else {
            this.area = 0;
            this._mass = 0;
        }
    }
    /** dts2md break */
    /**
     * @override PolygonNode.tag
     * @default 'body'
     */
    readonly tag: string = 'body';
    /** dts2md break */
    /**
     * The contacted bodies.
     * (Updated internally.)
     */
    readonly contacts = new Set<BodyNode<any>>();
    /** dts2md break */
    /**
     * Whether the object is active. (not static)
     * @default true
     */
    active: boolean;
    /** dts2md break */
    /**
     * Whether the object is draggable.
     * (Drag is handled by `WorldNode`.)
     * @default false
     */
    draggable: boolean;
    /** dts2md break */
    /**
     * The category of the object.
     * @default 0
     */
    category: number;
    /** dts2md break */
    /**
     * The collision filter of the object.
     * @default Category.FULL_MASK
     */
    collisionFilter: number;
    /** dts2md break */
    /**
     * The area of the object.
     */
    area!: number;
    /** dts2md break */
    /**
     * The sensor filter of the object.
     * @default 0
     */
    sensorFilter: number;
    /** dts2md break */
    /**
     * The velocity of the object.
     */
    velocity: Vector;
    /** dts2md break */
    /**
     * The accelaration of the object.
     */
    accelaration: Vector;
    /** dts2md break */
    /**
     * The gravity of the object.
     * @default null
     */
    gravity: Vector | null;
    /** dts2md break */
    /**
     * The impulse of the object.
     * (Updated internally.)
     */
    impulse = new Vector();
    /** dts2md break */
    /**
     * The stiffness of the object. (0~1)
     * @default 0.95
     */
    stiffness: number;
    /** dts2md break */
    /**
     * The elasticity of the object.
     * @default 0.3
     */
    elasticity: number;
    /** dts2md break */
    /**
     * The friction coefficient of the object.
     * @default 0.3
     */
    friction: number;
    /** dts2md break */
    /**
     * The static friction coefficient of the object.
     * @default 0.4
     */
    staticFriction: number;
    /** dts2md break */
    /**
     * The acceptable amount of overlap.
     * @default 0.1
     */
    slop: number;
    /** dts2md break */
    /**
     * Whether the vertices are placed clockwise.
     * (mathematically, not on canvas)
     * @default true
     */
    clockwise: boolean;
    /** dts2md break */
    /**
     * The precision(fraction digits) of tangent values of normal vectors.
     * (This helps reduce similar normal vectors.)
     * @default 6
     */
    normalPrecision: number;
    /** dts2md break */
    /**
     * Normal vectors of the polygon. (normalized)
     */
    normals: Vector[] = [];

    private _density: number;
    private _mass!: number;
    /** dts2md break */
    /**
     * Get the density of the object.
     */
    get density() {
        return this._density;
    }
    /** dts2md break */
    /**
     * Set the density of the object.
     * (This also updates the mass of the object.)
     */
    set density(density: number) {
        this._density = density;
        this._mass = this.area * density;
    }
    /** dts2md break */
    /**
     * Get the mass of the object.
     */
    get mass() {
        return this._mass;
    }
    /** dts2md break */
    /**
     * Set the mass of the object.
     * (This also updates the density of the object.)
     */
    set mass(mass: number) {
        this._mass = mass;
        this._density = mass / this.area;
    }

    private _updateVertices(vertices: Vector[]) {

        const { normals } = this;
        if (!normals) {
            return; // invoked in `super`
        }

        const { normalPrecision, clockwise } = this;
        const normalTangents = new Set();
        let totalArea = 0;
        let normalCount = 0;

        vertices.reduce(
            (v1, v2, i) => {

                // calculate area
                let area = v1.cross(v2);
                if (clockwise) {
                    area = -area;
                }
                totalArea += area;

                // update normals
                const dx = v2.x - v1.x;
                const dy = v2.y - v1.y;
                const tangent = (dy / dx).toFixed(normalPrecision);
                if (!normalTangents.has(tangent)) {
                    normalTangents.add(tangent);
                    let normalX, normalY;
                    if (clockwise) {
                        normalX = -dy;
                        normalY = dx;
                    } else {
                        normalX = dy;
                        normalY = -dx;
                    }
                    if (normalCount >= normals.length) {
                        const normal = new Vector(normalX, normalY);
                        normal.normalize();
                        normals.push(normal);
                    } else {
                        normals[normalCount].set(normalX, normalY).normalize();
                    }
                    normalCount++;
                }

                return v2;

            },
            vertices[vertices.length - 1],
        );

        normals.length = normalCount;
        this.area = totalArea;
        this._mass = totalArea * this.density;

    }
    /** dts2md break */
    /**
     * @override PolygonNode.updateVertices
     */
    updateVertices(vertices: Vector[]) {
        super.updateVertices(vertices);
        this._updateVertices(vertices);
    }
    /** dts2md break */
    /**
     * Get the projection of the body on specific direction.
     */
    project(direction: VectorLike): Projection {

        let min = Infinity;
        let max = -Infinity;

        let vertexProjection: number;
        this.vertices.forEach(vertex => {
            vertexProjection = vertex.project(direction);
            if (vertexProjection < min) {
                min = vertexProjection;
            }
            if (vertexProjection > max) {
                max = vertexProjection;
            }
        });

        const offsetProjection = this.offset.project(direction);
        min += offsetProjection;
        max += offsetProjection;

        const originProjection = this.originOffset.project(direction);
        min -= originProjection;
        max -= originProjection;

        return { min, max };

    }
    /** dts2md break */
    /**
     * @override CanvasNode.beforeUpdate
     */
    protected beforeUpdate(timeStamp: number) {

        if (!this.active) {
            return;
        }

        const { velocity, accelaration, gravity, impulse } = this;

        this.offset.addVector(velocity)
            .addVector(impulse);

        velocity.addVector(accelaration);
        if (gravity) {
            velocity.addVector(gravity);
        }

    }

}
