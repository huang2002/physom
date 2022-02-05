import { Event, Vector } from 'canvasom';
import { BodyNode, BodyNodeCollisionEvent } from './BodyNode';

/**
 * Type of collision checking results.
 */
export interface CollisionResult {
    readonly overlap: number;
    /**
     * Points to bodyB from bodyA.
     */
    readonly overlapVector: Vector;
}
/** dts2md break */
/**
 * Type of collision information.
 */
export interface CollisionInfo extends CollisionResult {
    readonly bodyA: BodyNode;
    readonly bodyB: BodyNode;
    readonly edgeVector: Vector | null;
    /**
     * bodyB.velocity - bodyA.velocity
     */
    readonly relativeVelocity: Vector;
}
/** dts2md break */
/**
 * Type of collision checkers.
 * (Returns a {@link CollisionResult} object
 * if the given two objects collide with each other;
 * returns `null` otherwise.)
 */
export type CollisionChecker = (bodyA: BodyNode, bodyB: BodyNode) => CollisionResult | null;
/** dts2md break */
/**
 * Collision-related APIs.
 */
export namespace Collision {
    /** dts2md break */
    /**
     * Find collisions among the given bodies.
     */
    export const find = (
        bodies: BodyNode[],
        checker: CollisionChecker,
    ): CollisionInfo[] => {

        const results: CollisionInfo[] = [];
        const bodiesCount = bodies.length;

        for (let i = 0; i < bodiesCount; i++) {

            const bodyA = bodies[i];
            const { category: category1, velocity: velocity1 } = bodyA;

            for (let j = i + 1; j < bodiesCount; j++) {

                const bodyB = bodies[j];

                if (
                    !(category1 & bodyB.collisionFilter)
                    || !(bodyA.collisionFilter & bodyB.category)
                ) {
                    continue;
                }

                const collisionResult = checker(bodyA, bodyB);
                if (!collisionResult) {
                    continue;
                }

                const { overlapVector } = collisionResult;
                results.push({
                    ...collisionResult,
                    bodyA,
                    bodyB,
                    edgeVector: overlapVector.isZero()
                        ? null
                        : overlapVector.clone().tangent().normalize(),
                    relativeVelocity: bodyB.velocity.clone().subVector(velocity1),
                });

            }

        }

        return results;

    };
    /** dts2md break */
    /**
     * Handle the given collisions.
     */
    export const handle = (
        collisions: CollisionInfo[],
        timeStamp?: number,
    ) => {

        const { maxStaticSpeed } = BodyNode;
        const { min, max, abs, sign } = Math;

        collisions.filter(collisionInfo => { // handle bounce

            const { bodyA, bodyB, overlapVector } = collisionInfo;
            const { velocity: v1, mass: m1, impulse: impulse1 } = bodyA;

            const event1: BodyNodeCollisionEvent = new Event({
                name: 'collision',
                stoppable: true,
                cancelable: true,
                timeStamp,
                data: {
                    ...collisionInfo,
                    target: bodyB,
                },
            });
            bodyA.emit(event1);

            const event2: BodyNodeCollisionEvent = new Event({
                name: 'collision',
                stoppable: true,
                cancelable: true,
                timeStamp,
                data: {
                    ...collisionInfo,
                    target: bodyA,
                },
            });
            bodyB.emit(event2);

            if (
                event1.canceled
                || event2.canceled
                || (bodyA.category & bodyB.sensorFilter)
                || (bodyA.sensorFilter & bodyB.category)
            ) {
                return false;
            }

            const slop = min(bodyA.slop, bodyB.slop);
            const impulse = collisionInfo.overlap * min(bodyA.stiffness, bodyB.stiffness);
            const impulseScale = (impulse > slop) ? ((impulse - slop) / impulse) : 0;
            const { velocity: v2, mass: m2, impulse: impulse2 } = bodyB;
            const { overlap, edgeVector, relativeVelocity } = collisionInfo;
            const elasticity = max(bodyA.elasticity, bodyB.elasticity);
            const bounceScale = elasticity + 1;
            const relativeNormalSpeed = relativeVelocity.project(overlapVector);

            if (bodyA.active) {

                if (bodyB.active) { // both active

                    if (impulseScale) {
                        Vector.distribute(
                            overlapVector,
                            impulse1,
                            impulse2,
                            m2,
                            -m1,
                            impulseScale,
                        );
                    }

                    if (edgeVector && (relativeNormalSpeed < 0)) {
                        // note that `relativeNormalSpeed` is negative here
                        Vector.distribute(
                            overlapVector,
                            v1,
                            v2,
                            -m2,
                            m1,
                            relativeNormalSpeed / overlap * bounceScale,
                        );
                    }

                } else { // only bodyA is active

                    if (impulseScale) {
                        impulse1.subVector(overlapVector, impulseScale);
                    }

                    if (edgeVector && (relativeNormalSpeed < 0)) {
                        // note that `relativeNormalSpeed` is negative here
                        v1.addVector(
                            overlapVector,
                            relativeNormalSpeed / overlap * bounceScale,
                        );
                    }

                }

            } else { // bodyA is inactive

                if (bodyB.active) { // only bodyB is active

                    if (impulseScale) {
                        impulse2.addVector(overlapVector, impulseScale);
                    }

                    if (edgeVector && (relativeNormalSpeed < 0)) {
                        // note that `relativeNormalSpeed` is negative here
                        v2.subVector(
                            overlapVector,
                            relativeNormalSpeed / overlap * bounceScale,
                        );
                    }

                } else { // both inactive
                    return false;
                }

            }

            return (edgeVector !== null);

        }).forEach(collisionInfo => { // handle friction

            const { bodyA, bodyB } = collisionInfo;

            bodyA.contacts.add(bodyB);
            bodyB.contacts.add(bodyA);

            const { velocity: v1, mass: m1 } = bodyA;
            const { velocity: v2, mass: m2 } = bodyB;

            const friction = min(bodyA.friction, bodyB.friction);
            const staticFriction = min(bodyA.staticFriction, bodyB.staticFriction);
            if (!staticFriction) {
                return;
            }

            const { overlap, edgeVector, relativeVelocity } = collisionInfo;
            const relativeEdgeSpeed = relativeVelocity.project(edgeVector!);
            const absRelativeEdgeSpeed = abs(relativeEdgeSpeed);

            if (bodyA.active) {

                if (bodyB.active) { // both active

                    if (
                        ((absRelativeEdgeSpeed < maxStaticSpeed)
                            && (overlap * staticFriction >= absRelativeEdgeSpeed))
                        || (overlap * friction >= absRelativeEdgeSpeed)
                    ) {
                        Vector.distribute(
                            edgeVector!,
                            v1,
                            v2,
                            -m2,
                            m1,
                            relativeEdgeSpeed,
                        );
                    } else if (friction) {
                        Vector.distribute(
                            edgeVector!,
                            v1,
                            v2,
                            -m2,
                            m1,
                            overlap * friction * sign(relativeEdgeSpeed),
                        );
                    }

                } else { // only bodyA is active

                    if (
                        (absRelativeEdgeSpeed < maxStaticSpeed)
                        && (overlap * staticFriction >= absRelativeEdgeSpeed)
                        || (overlap * friction >= absRelativeEdgeSpeed)
                    ) {
                        v1.addVector(
                            edgeVector!,
                            relativeEdgeSpeed,
                        );
                    } else if (friction) {
                        v1.addVector(
                            edgeVector!,
                            overlap * friction * sign(relativeEdgeSpeed),
                        );
                    }

                }

            } else { // bodyA is inactive

                // The cases where both bodies are inactive
                // have been excluded in the filter callback above.

                if (
                    (absRelativeEdgeSpeed < maxStaticSpeed)
                    && (overlap * staticFriction >= absRelativeEdgeSpeed)
                    || (overlap * friction >= absRelativeEdgeSpeed)
                ) {
                    v2.subVector(
                        edgeVector!,
                        relativeEdgeSpeed,
                    );
                } else if (friction) {
                    v2.subVector(
                        edgeVector!,
                        overlap * friction * sign(relativeEdgeSpeed),
                    );
                }

            }

        });

    };
    /** dts2md break */
    /**
     * Equal to `Collision.handle(Collision.find(bodies, checker))`.
     */
    export const findAndHandle = (
        bodies: BodyNode[],
        checker: CollisionChecker,
        timeStamp?: number,
    ) => {
        const collisions = find(bodies, checker);
        handle(collisions, timeStamp);
    };
    /** dts2md break */
    /**
     * Built-in checkers.
     */
    export namespace Checkers {
        /** dts2md break */
        /**
         * AABB collision checker.
         * (Uses box models; checks bounds only)
         */
        export const AABB: CollisionChecker = (bodyA, bodyB) => {

            const { bounds: bounds1 } = bodyA;
            const { bounds: bounds2 } = bodyB;

            let delta = bounds1.right - bounds2.left;
            let minOverlap = delta;
            let overlapX = delta;
            let overlapY = 0;

            if (delta < 0) {
                return null;
            }

            delta = bounds1.left - bounds2.right;
            if (delta > 0) {
                return null;
            } else if (-delta < minOverlap) {
                minOverlap = -delta;
                overlapX = delta;
                // overlapY is already 0.
            }

            delta = bounds1.bottom - bounds2.top;
            if (delta < 0) {
                return null;
            } else if (delta < minOverlap) {
                minOverlap = delta;
                overlapX = 0;
                overlapY = delta;
            }

            delta = bounds1.top - bounds2.bottom;
            if (delta > 0) {
                return null;
            } else if (-delta < minOverlap) {
                minOverlap = -delta;
                overlapX = 0;
                overlapY = delta;
            }

            return {
                overlap: minOverlap,
                overlapVector: new Vector(overlapX, overlapY),
            };

        };
        /** dts2md break */
        /**
         * Separate Axis Testing.
         * (Uses polygon vertices to check collisions.)
         */
        export const SAT: CollisionChecker = (bodyA, bodyB) => {

            const normals = bodyA.normals.concat(bodyB.normals);

            let minDirection: Vector | null = null;
            let minOverlap = Infinity;

            for (let i = 0; i < normals.length; i++) {

                const direction = normals[i];
                const projection1 = bodyA.project(direction);
                const projection2 = bodyB.project(direction);

                if (
                    (projection1.min > projection2.max)
                    || (projection1.max < projection2.min)
                ) {
                    return null;
                }

                const overlap1 = projection1.max - projection2.min;
                const overlap2 = projection2.max - projection1.min;

                if (overlap1 < overlap2) {
                    if (overlap1 < minOverlap) {
                        minOverlap = overlap1;
                        minDirection = direction;
                    }
                } else {
                    if (overlap2 < minOverlap) {
                        minOverlap = overlap2;
                        minDirection = direction.reverse();
                    }
                }

            }

            return minDirection && {
                overlap: minOverlap,
                overlapVector: minDirection.clone().scale(minOverlap)
            };

        };

    };

}
