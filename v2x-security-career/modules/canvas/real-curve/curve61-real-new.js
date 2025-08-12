// Curve61의 실수체 버전: y² = x³ - x + 1
// G = (1, 1) 사용

let curveA = -1;
let curveB = 1;
let baseX = 1; // 기저점 x 좌표

/**
 * @return {Point} base point
 */
function P() {
    // y² = x³ - x + 1 곡선의 기저점 G = (1, 1)
    return { x: 1, y: 1 };
}

/**
 * Compute the y-coordinate for the curve
 * @param x x-coordinate
 * @return {Number|NaN} y-coordinate (positive) if defined by curve
 */
function y(x) {
    return Math.sqrt(x**3 + curveA*x + curveB);
}

/**
 * Add two points on the curve. This function supports doubling.
 * @param P {Point}
 * @param Q {Point}
 * @return {Point} R such that P + Q = -R
 */
function add(P, Q) {
    if (!P) return Q;
    if (!Q) return P;
    if (P.x === Q.x && P.y !== Q.y) {
        return NaN;
    }
    const m = slope(P, Q);
    if (Number.isNaN(m)) {
        return NaN;
    }

    const x = m ** 2 - P.x - Q.x;
    const y = P.y + m * (x - P.x);
    return { x, y: -y };
}

/**
 * @param point {Point}
 * @return {Point} negated point
 */
function negate(point) {
    return {x: point.x, y: -point.y};
}

/**
 * Compute the slope of the secant/tangent line between two points on the curve
 * @param P {Point}
 * @param Q {Point}
 * @return {Number} slope
 */
function slope(P, Q) {
    if (Q.x === P.x && Q.y !== P.y) {
        return Infinity;
    }
    if (P.x === Q.x) {
        // doubling: slope is a tangent
        return (3 * P.x * P.x + curveA) / (2 * P.y);
    } else {
        return (P.y - Q.y) / (P.x - Q.x);
    }
}

export { P, y, add, negate, slope, curveA, curveB, baseX };