/**
 * Operations of curve61
 *
 * Curve61 is the Weierstrass curve y^2 = x^3 + Ax + B in the field Fp where p = 61.
 * 
 * 실제 정보 (코드 참조용):
 * - 유한체 크기: p = 61 (그래서 "Curve61"이라는 이름)
 * - 타원곡선: y² = x³ - 3x + 3 (mod 61)
 * - 유한체 상의 점: 72개
 * - 무한원점 포함 총 점: 73개
 * - 생성원 P(1,1)의 위수: 73 (소수)
 * - 73P = O (무한원점)
 * - 74P = 1P로 순환
 * 
 * 참고: 화면에는 "Curve61"로 표시하지만, 실제로는 73개의 점을 가진 순환군
 */

import * as field from './field.js';

let curveA = -3;
let curveB = 3;
let basePointX = 1;
let basePointOrder = 73;

/**
 * @typedef Point {{x: Number, y: Number}}
 */

// for testing
function setCurveParams(a, b, px) {
    curveA = a;
    curveB = b;
    basePointX = px;
    return !!Y(basePointX);
}

/**
 * Return the base point
 * @return {Point}
 */
function P() {
    return {x: basePointX, y: Math.min(...Y(basePointX))};
}

/**
 * For the given X coordinate, find Y values (if any) on the curve.
 * @param x {Number} X coordinate in range 0...p
 * @return {Number[2]|undefined} the two Y coordinates for X, if defined for the curve
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
 * For the given point, double it on the curve.
 *
 * @param P {Point} the point to double
 * @return {Point} the result
 */
function pointDouble(P) {
    return pointAdd(P, P);
}

/**
 * Add two points on the curve to get a third point.
 *
 * @param P
 * @param Q
 * @return {Point} R = P + Q
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
 * Scalar multiplication of a point P on a curve via double-and-add method.
 *
 * @param P {Point} point
 * @param n {Number} scalar
 * @return {Point|null} result nP
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
 * (really this is just mirroring it on y=field.p/2)
 *
 * @param P {Point}
 * @return {Point} -P
 */
function negate(P) {
    return { x: P.x, y: field.negate(P.y) };
}

/**
 * Compute the slope between two points (or the tangent if both points are same).
 * @param P {Point}
 * @param Q {Point}
 * @return {Number}
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
 *
 * @param P {Point} point on the curve
 */
function tangent(P) {
    return slope(P, P);
}

// Add times and isOnCurve functions
function times(P, n) {
    if (n === 0 || n === 73) return null;
    let result = null;
    for (let i = 0; i < n; i++) {
        result = pointAdd(result, P);
    }
    return result;
}

function isOnCurve(point) {
    if (!point || !point.x || !point.y) return false;
    const left = field.reduce(field.pow(point.y, 2));
    const right = field.reduce(field.pow(point.x, 3) + curveA * point.x + curveB);
    return left === right;
}

export {
    setCurveParams,
    basePointOrder,
    curveA,
    curveB,
    P,
    Y,
    pointDouble,
    pointAdd,
    pointMult,
    negate,
    tangent,
    times,
    isOnCurve,
};
