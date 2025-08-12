/**
 * Operations of curve61 - ISOLATED VERSION
 * Factory pattern for creating independent curve instances
 *
 * Curve61 is the Weierstrass curve y^2 = x^3 + Ax + B in the field Fp
 */

import { createFieldInstance } from './field-isolated.js';

/**
 * Create an isolated curve instance with its own parameters
 * @param {Number} fieldSize - The field size (default: 61)
 * @param {Object} params - Curve parameters
 * @returns {Object} Curve operations object with isolated state
 */
export function createCurveInstance(fieldSize = 61, params = {}) {
    // Create an isolated field instance for this curve
    const field = createFieldInstance(fieldSize);
    
    // Private state for this curve instance
    let curveA = params.a !== undefined ? params.a : -3;
    let curveB = params.b !== undefined ? params.b : 3;
    let basePointX = params.baseX !== undefined ? params.baseX : 1;
    let basePointOrder = params.order !== undefined ? params.order : 73;
    
    /**
     * For the given X coordinate, find Y values (if any) on the curve.
     */
    function Y(x) {
        let YY = field.pow(x, 3) + curveA * x + curveB;
        try {
            return field.sqrt(field.reduce(YY));
        } catch (e) {
            return undefined;
        }
    }
    
    /**
     * Return the base point
     */
    function P() {
        const yVals = Y(basePointX);
        if (!yVals) return null;
        return {x: basePointX, y: Math.min(...yVals)};
    }
    
    /**
     * Set curve parameters for this instance
     */
    function setCurveParams(a, b, px) {
        curveA = a;
        curveB = b;
        basePointX = px;
        // Validate that the base point is on the curve
        return !!Y(basePointX);
    }
    
    /**
     * Add two points on the curve to get a third point.
     */
    function pointAdd(P, Q) {
        if (!P) return Q;
        if (!Q) return P;
        if (P.x === Q.x && P.y !== Q.y) return null;
        const m = slope(P, Q);
        let x = field.reduce(field.pow(m, 2) - P.x - Q.x);
        let y = field.reduce(m * (P.x - x) - P.y);
        if (Object.is(x, -0)) x = 0;
        if (Object.is(y, -0)) y = 0;
        return {x, y};
    }
    
    /**
     * For the given point, double it on the curve.
     */
    function pointDouble(P) {
        return pointAdd(P, P);
    }
    
    /**
     * Scalar multiplication of a point P on a curve via double-and-add method.
     */
    function pointMult(P, n) {
        const bits = Math.floor(Math.log2(n));
        const doubledPoints = {};
        doubledPoints[0] = P;
        for (let i = 1; i <= bits; i++) {
            P = pointDouble(P);
            doubledPoints[i] = P;
        }

        let result = null;
        let bit = 0;
        while (n !== 0) {
            if ((n & 1) === 1) {
                result = pointAdd(result, doubledPoints[bit]);
            }
            n >>= 1;
            bit++;
        }

        return result;
    }
    
    /**
     * Negate the point P to -P
     */
    function negate(P) {
        return { x: P.x, y: field.negate(P.y) };
    }
    
    /**
     * Compute the slope between two points (or the tangent if both points are same).
     */
    function slope(P, Q) {
        if (P.x === Q.x && P.y === Q.y) {
            return field.reduce((3 * field.pow(P.x, 2) + curveA) * field.inverseOf(2 * P.y));
        } else {
            return field.reduce((Q.y - P.y) * field.inverseOf(Q.x - P.x));
        }
    }
    
    /**
     * Calculate the slope tangent at point P.
     */
    function tangent(P) {
        return slope(P, P);
    }
    
    // Return the public API for this curve instance
    return {
        // Expose parameters as getters
        get curveA() { return curveA; },
        get curveB() { return curveB; },
        get basePointOrder() { return basePointOrder; },
        
        // Expose field instance for direct field operations if needed
        field,
        
        // Functions
        setCurveParams,
        P,
        Y,
        pointDouble,
        pointAdd,
        pointMult,
        negate,
        tangent,
        
        // For debugging/testing
        _getState() {
            return { curveA, curveB, basePointX, basePointOrder, fieldP: field.p };
        }
    };
}

/**
 * Create a default instance for backward compatibility
 * This will be used by modules that don't create their own instance
 */
const defaultInstance = createCurveInstance(61, {
    a: -3,
    b: 3,
    baseX: 1,
    order: 73
});

// Export individual functions for backward compatibility
export const setCurveParams = defaultInstance.setCurveParams;
export const P = defaultInstance.P;
export const Y = defaultInstance.Y;
export const pointDouble = defaultInstance.pointDouble;
export const pointAdd = defaultInstance.pointAdd;
export const pointMult = defaultInstance.pointMult;
export const negate = defaultInstance.negate;
export const tangent = defaultInstance.tangent;

// Export parameters
export const curveA = defaultInstance.curveA;
export const curveB = defaultInstance.curveB;
export const basePointOrder = defaultInstance.basePointOrder;

// Also export the default instance itself
export default defaultInstance;