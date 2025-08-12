// Curve73의 실수체 버전: y² = x³ - 3x + 3
// 유한체 Curve73과 동일한 방정식 사용

let curveA = -3;
let curveB = 3;
let baseX = 1; // 기저점 x 좌표

/**
 * @return {Point} base point
 */
function P() {
    // y² = x³ - 3x + 3 곡선의 기저점 G = (1, 1)
    return { x: 1, y: 1 };
}

/**
 * Compute the y-coordinate for the curve
 * @param x x-coordinate
 * @return {Number|NaN} y-coordinate (positive) if defined by curve
 */
function y(x) {
    const val = x**3 + curveA*x + curveB;
    return val >= 0 ? Math.sqrt(val) : NaN;
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
        return null; // 무한원점
    }
    const m = slope(P, Q);
    if (Number.isNaN(m) || !isFinite(m)) {
        return null;
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
    if (!point) return null;
    return {x: point.x, y: -point.y};
}

/**
 * Compute the slope of the secant/tangent line between two points on the curve
 * @param P {Point}
 * @param Q {Point}
 * @return {Number} slope
 */
function slope(P, Q) {
    if (!P || !Q) return NaN;
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