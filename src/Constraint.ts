import { CanvasNode, CanvasNodeEvents, CanvasNodeOptions, Vector, type Renderer } from 'canvasom';
import type { BodyNode } from './BodyNode';

/**
 * Type of options for {@link ConstraintNode}.
 */
export type ConstraintNodeOptions<Events extends CanvasNodeEvents> = (
    & CanvasNodeOptions<Events>
    & Partial<{
        /**
         * Whether the constraint is activated.
         * @default true
         */
        active: boolean;
        /**
         * One of the two bodies controlled by this constraint.
         * (The constraint only takes effect
         * when `(bodyA !== null) && (bodyB !== null)`.)
         * @default null
         */
        bodyA: BodyNode | null;
        /**
         * One of the two bodies controlled by this constraint.
         * (The constraint only takes effect
         * when `(bodyA !== null) && (bodyB !== null)`.)
         * @default null
         */
        bodyB: BodyNode | null;
        /**
         * Minimum length.
         * @default options.length
         */
        minLength: number;
        /**
         * Maximum length.
         * @default Math.max(options.minLength, options.length)
         */
        maxLength: number;
        /**
         * Default value of `minLength` and `maxLength`.
         * @default (bodyA && bodyB) ? Vector.distance(bodyA.offset, bodyB.offset) : 0
         */
        length: number;
        /**
         * The stiffness of the constraint.
         * @default 0.95
         */
        stiffness: number;
        /**
         * The stiffness of the constraint.
         * @default 0.1
         */
        elasticity: number;
        /**
         * The anchor position on `bodyA`. (relative to `bodyA`)
         * @default bodyA !=== null
         * ? (new Vector(bodyA.bounds.width / 2, bodyA.bounds.height / 2))
         * : new Vector()
         */
        anchorA: Vector;
        /**
         * The anchor position on `bodyB`. (relative to `bodyB`)
         * @default bodyA !=== null
         * ? (new Vector(bodyB.bounds.width / 2, bodyB.bounds.height / 2))
         * : new Vector()
         */
        anchorB: Vector;
    }>
);
/** dts2md break */
/**
 * Class of constraint nodes.
 */
export class ConstraintNode<Events extends CanvasNodeEvents = CanvasNodeEvents>
    extends CanvasNode<Events> {
    /** dts2md break */
    /**
     * Constructor of {@link ConstraintNode}.
     */
    constructor(options?: ConstraintNodeOptions<Events>) {

        super(options);

        const bodyA = options?.bodyA ?? null;
        const bodyB = options?.bodyB ?? null;
        const defaultLength = options?.length ?? (
            (bodyA && bodyB)
                ? Vector.distance(bodyA.offset, bodyB.offset)
                : 0
        );

        this.active = options?.active ?? true;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.minLength = options?.minLength ?? defaultLength;
        this.maxLength = options?.maxLength
            ?? Math.max(this.minLength, defaultLength);
        this.stiffness = options?.stiffness ?? 0.95;
        this.elasticity = options?.elasticity ?? 0.1;

        if (options?.anchorA) {
            this.anchorA = options.anchorA;
        } else if (bodyA) {
            const { bounds } = bodyA;
            this.anchorA = new Vector(bounds.width / 2, bounds.height / 2);
        } else {
            this.anchorA = new Vector();
        }

        if (options?.anchorB) {
            this.anchorB = options.anchorB;
        } else if (bodyB) {
            const { bounds } = bodyB;
            this.anchorB = new Vector(bounds.width / 2, bounds.height / 2);
        } else {
            this.anchorB = new Vector();
        }

    }
    /** dts2md break */
    /**
     * @override CanvasNode.tag
     * @default 'constraint'
     */
    readonly tag: string = 'constraint';
    /** dts2md break */
    /**
     * Whether the constraint is activated.
     * @default true
     */
    active: boolean;
    /** dts2md break */
    /**
     * One of the two bodies controlled by this constraint.
     * (The constraint only takes effect
     * when `(bodyA !== null) && (bodyB !== null)`.)
     * @default null
     */
    bodyA: BodyNode | null;
    /** dts2md break */
    /**
     * One of the two bodies controlled by this constraint.
     * (The constraint only takes effect
     * when `(bodyA !== null) && (bodyB !== null)`.)
     * @default null
     */
    bodyB: BodyNode | null;
    /** dts2md break */
    /**
     * The stiffness of the constraint.
     * @default 0.95
     */
    stiffness: number;
    /** dts2md break */
    /**
     * The stiffness of the constraint.
     * @default 0.1
     */
    elasticity: number;
    /** dts2md break */
    /**
     * Minimum length.
     * @default options.length
     */
    minLength: number;
    /** dts2md break */
    /**
     * Maximum length.
     * @default Math.max(options.minLength, options.length)
     */
    maxLength: number;
    /** dts2md break */
    /**
     * The anchor position on `bodyA`. (relative to `bodyA`)
     * @default bodyA !=== null
     * ? (new Vector(bodyA.bounds.width / 2, bodyA.bounds.height / 2))
     * : new Vector()
     */
    anchorA: Vector;
    /** dts2md break */
    /**
     * The anchor position on `bodyB`. (relative to `bodyB`)
     * @default bodyA !=== null
     * ? (new Vector(bodyB.bounds.width / 2, bodyB.bounds.height / 2))
     * : new Vector()
     */
    anchorB: Vector;
    /** dts2md break */
    /**
     * @override CanvasNode.updateLayout
     */
    protected updateLayout(timeStamp: number) {

        if (!this.active) {
            return;
        }

        let { bodyA, bodyB } = this;
        if (!bodyA || !bodyB) {
            return;
        }

        // try to make bodyB the active one
        if (!bodyB.active) {
            if (!bodyA.active) {
                return; // both inactive
            } else {
                const t = bodyA;
                bodyA = bodyB;
                bodyB = t;
            }
        }

        const { minLength, maxLength, stiffness, elasticity, anchorA, anchorB } = this;
        const { offset: offsetA } = bodyA;
        const { offset: offsetB } = bodyB;
        const offset = new Vector(
            (offsetB.x + anchorB.x) - (offsetA.x + anchorA.x),
            (offsetB.y + anchorB.y) - (offsetA.y + anchorA.y),
        );
        const distance = offset.norm;

        if (!distance) {
            return; // anchors coincide
        }

        if (bodyA.active) { // both active

            const { mass: m1, velocity: v1 } = bodyA;
            const { mass: m2, velocity: v2 } = bodyB;
            const relativeNormalSpeed = v2.project(offset) - v1.project(offset);

            if (distance > maxLength) {

                Vector.distribute(
                    offset,
                    bodyA.impulse,
                    bodyB.impulse,
                    -m2,
                    m1,
                    (distance - maxLength) / distance * stiffness,
                );

                if (relativeNormalSpeed > 0) {
                    Vector.distribute(
                        offset,
                        v1,
                        v2,
                        -m2,
                        m1,
                        relativeNormalSpeed / distance * stiffness,
                    );
                }

                if (elasticity) {
                    Vector.distribute(
                        offset,
                        v1,
                        v2,
                        -m2,
                        m1,
                        (distance - maxLength) / distance * elasticity,
                    );
                }

            } else if (distance < minLength) {

                Vector.distribute(
                    offset,
                    bodyA.impulse,
                    bodyB.impulse,
                    m2,
                    -m1,
                    (minLength - distance) / distance * stiffness,
                );

                if (relativeNormalSpeed < 0) {
                    // note that `relativeNormalSpeed` is negative here
                    Vector.distribute(
                        offset,
                        v1,
                        v2,
                        -m2,
                        m1,
                        relativeNormalSpeed / distance * stiffness,
                    );
                }

                if (elasticity) {
                    Vector.distribute(
                        offset,
                        v1,
                        v2,
                        m2,
                        -m1,
                        (minLength - distance) / distance * elasticity,
                    );
                }

            }

        } else { // only bodyB is active

            const { velocity } = bodyB;
            const relativeNormalSpeed = velocity.project(offset);

            if (distance > maxLength) {

                bodyB.impulse.subVector(
                    offset,
                    (distance - maxLength) / distance * stiffness,
                );

                if (relativeNormalSpeed > 0) {
                    velocity.subVector(
                        offset,
                        relativeNormalSpeed / distance * stiffness,
                    );
                }

                if (elasticity) {
                    velocity.subVector(
                        offset,
                        (distance - maxLength) / distance * elasticity,
                    );
                }

            } else if (distance < minLength) {

                bodyB.impulse.addVector(
                    offset,
                    (minLength - distance) / distance * stiffness,
                );

                if (relativeNormalSpeed < 0) {
                    // note that `relativeNormalSpeed` is negative here
                    velocity.subVector(
                        offset,
                        relativeNormalSpeed / distance * stiffness,
                    );
                }

                if (elasticity) {
                    velocity.addVector(
                        offset,
                        (minLength - distance) / distance * elasticity,
                    );
                }

            }

        }

    }
    /** dts2md break */
    /**
     * @override CanvasNode.renderSelf
     */
    protected renderSelf(renderer: Renderer) {

        if (!this.computedStyle.strokeStyle) {
            return;
        }

        const { bodyA, bodyB } = this;
        if (!bodyA || !bodyB) {
            return;
        }

        const { context } = renderer;
        const { position: { x: x2, y: y2 }, offset: offsetB } = bodyB;
        const { offset: offsetA } = bodyA;
        const x1 = x2 - offsetB.x + offsetA.x;
        const y1 = y2 - offsetB.y + offsetA.y;
        const { anchorA, anchorB } = this;
        context.beginPath();
        context.moveTo(
            x1 + anchorA.x,
            y1 + anchorA.y,
        );
        context.lineTo(
            x2 + anchorB.x,
            y2 + anchorB.y,
        );
        context.stroke();

    }

}
