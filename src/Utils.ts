import { BodyNode, BodyNodeEvents } from './BodyNode';

/**
 * Utility APIs.
 */
export namespace Utils {
    /** dts2md break */
    /**
     * Create an anchor body at specific position.
     * (Equal to: `new BodyNode({ offsetX, offsetY, active: false })`.)
     */
    export const createAnchor = <Events extends BodyNodeEvents = BodyNodeEvents>(
        offsetX: number,
        offsetY: number,
    ): BodyNode<Events> => (
        new BodyNode<Events>({
            offsetX,
            offsetY,
            active: false,
        })
    );

}
