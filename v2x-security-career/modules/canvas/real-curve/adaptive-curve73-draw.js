import * as curve from './curve73-real.js';
import * as common from '../common.js';
const TWO_PI = 2 * Math.PI;

// y² = x³ - 3x + 3 곡선 (Curve73과 동일한 방정식)
const curveColor = '#33f';

/**
 * 표시할 점들을 기반으로 적응형 범위 계산
 * @param {Array<Point>} points - 표시할 점들의 배열
 * @param {number} padding - 여백 비율 (기본값 0.2 = 20%)
 * @return {Object} dimensions
 */
function calculateAdaptiveDimensions(points, padding = 0.2) {
    if (!points || points.length === 0) {
        // 기본 범위
        return {xMin: -3, xMax: 7, yMin: -5, yMax: 5};
    }
    
    // 모든 점의 최소/최대값 찾기
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    
    points.forEach(point => {
        if (point && point.x !== undefined && point.y !== undefined) {
            xMin = Math.min(xMin, point.x);
            xMax = Math.max(xMax, point.x);
            yMin = Math.min(yMin, point.y);
            yMax = Math.max(yMax, point.y);
        }
    });
    
    // 범위가 너무 작으면 최소 범위 보장
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const minRange = 10;
    
    if (xRange < minRange) {
        const center = (xMin + xMax) / 2;
        xMin = center - minRange / 2;
        xMax = center + minRange / 2;
    }
    
    if (yRange < minRange) {
        const center = (yMin + yMax) / 2;
        yMin = center - minRange / 2;
        yMax = center + minRange / 2;
    }
    
    // padding 추가
    const xPadding = (xMax - xMin) * padding;
    const yPadding = (yMax - yMin) * padding;
    
    // 정사각형 비율 유지 옵션
    const makeSquare = true;
    if (makeSquare) {
        const maxRange = Math.max(xMax - xMin + 2 * xPadding, yMax - yMin + 2 * yPadding);
        const xCenter = (xMin + xMax) / 2;
        const yCenter = (yMin + yMax) / 2;
        
        return {
            xMin: xCenter - maxRange / 2,
            xMax: xCenter + maxRange / 2,
            yMin: yCenter - maxRange / 2,
            yMax: yCenter + maxRange / 2
        };
    }
    
    return {
        xMin: xMin - xPadding,
        xMax: xMax + xPadding,
        yMin: yMin - yPadding,
        yMax: yMax + yPadding
    };
}

/**
 * @param ctx {CanvasRenderingContext2D}
 * @param dimensions {Object} adaptive dimensions
 * @return {PreCalcVals}
 */
function preCalcValues(ctx, dimensions) {
    const dotRadius = 3;
    const w = ctx.canvas.getBoundingClientRect().width;
    const h = ctx.canvas.getBoundingClientRect().height;

    const d = dimensions;
    return {
        ctx, w, h, dotRadius,
        xMin: d.xMin, xMax: d.xMax, xSpan: d.xMax - d.xMin,
        yMin: d.yMin, yMax: d.yMax, ySpan: d.yMax - d.yMin
    };
}

/**
 * Given an x,y point return the coordinates transformed for the JS Canvas context
 * @param vals {PreCalcVals}
 * @param x {Number} 
 * @param y {Number} 
 * @param halfPixel {Boolean?} if set, round all pixels to nearest .5 (true) or .0 (false)
 * @return {Number[2]} x,y values transformed for canvas context
 */
function pointToCtx(vals, x, y, halfPixel) {
    let v = [(x - vals.xMin) / vals.xSpan * vals.w,
        vals.h - ((y - vals.yMin) / vals.ySpan * vals.h)];
    if (halfPixel) {
        v[0] = ((v[0]+0.5) | 0) - 0.5;
        v[1] = ((v[1]+0.5) | 0) - 0.5;
    } else if (halfPixel === false) {
        v[0] = ((v[0]+0.5) | 0);
        v[1] = ((v[1]+0.5) | 0);
    }
    return v;
}

/**
 * Draw the curve on the canvas with adaptive range
 * @param ctx {CanvasRenderingContext2D}
 * @param dimensions {Object} adaptive dimensions
 */
async function drawCurve(ctx, dimensions) {
    const vals = preCalcValues(ctx, dimensions);
    
    // Clear canvas
    ctx.clearRect(0, 0, vals.w, vals.h);
    
    // Draw axes
    ctx.save();
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // x-axis (if 0 is in range)
    if (vals.yMin <= 0 && vals.yMax >= 0) {
        ctx.moveTo(...pointToCtx(vals, vals.xMin, 0, true));
        ctx.lineTo(...pointToCtx(vals, vals.xMax, 0, true));
    }
    // y-axis (if 0 is in range)
    if (vals.xMin <= 0 && vals.xMax >= 0) {
        ctx.moveTo(...pointToCtx(vals, 0, vals.yMin, true));
        ctx.lineTo(...pointToCtx(vals, 0, vals.yMax, true));
    }
    ctx.stroke();
    
    // Draw grid lines (adaptive spacing based on range)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    
    // Calculate appropriate grid spacing
    const xSpacing = Math.pow(10, Math.floor(Math.log10(vals.xSpan / 5)));
    const ySpacing = Math.pow(10, Math.floor(Math.log10(vals.ySpan / 5)));
    
    // Vertical lines
    for (let x = Math.ceil(vals.xMin/xSpacing)*xSpacing; x <= vals.xMax; x += xSpacing) {
        ctx.moveTo(...pointToCtx(vals, x, vals.yMin, true));
        ctx.lineTo(...pointToCtx(vals, x, vals.yMax, true));
    }
    // Horizontal lines
    for (let y = Math.ceil(vals.yMin/ySpacing)*ySpacing; y <= vals.yMax; y += ySpacing) {
        ctx.moveTo(...pointToCtx(vals, vals.xMin, y, true));
        ctx.lineTo(...pointToCtx(vals, vals.xMax, y, true));
    }
    ctx.stroke();
    
    // Draw curve: y² = x³ - 3x + 3 (Curve73과 동일)
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2;
    
    // Calculate step size based on range (finer steps for smaller ranges)
    const stepSize = vals.xSpan / 500;
    
    // Upper branch (positive y)
    ctx.beginPath();
    let started = false;
    for (let x = vals.xMin; x <= vals.xMax; x += stepSize) {
        const yVal = curve.y(x);
        if (!isNaN(yVal) && yVal !== undefined && yVal <= vals.yMax) {
            const point = pointToCtx(vals, x, yVal);
            if (!started) {
                ctx.moveTo(...point);
                started = true;
            } else {
                ctx.lineTo(...point);
            }
        } else if (started) {
            ctx.stroke();
            ctx.beginPath();
            started = false;
        }
    }
    ctx.stroke();
    
    // Lower branch (negative y)
    ctx.beginPath();
    started = false;
    for (let x = vals.xMin; x <= vals.xMax; x += stepSize) {
        const yVal = curve.y(x);
        if (!isNaN(yVal) && yVal !== undefined && -yVal >= vals.yMin) {
            const point = pointToCtx(vals, x, -yVal);
            if (!started) {
                ctx.moveTo(...point);
                started = true;
            } else {
                ctx.lineTo(...point);
            }
        } else if (started) {
            ctx.stroke();
            ctx.beginPath();
            started = false;
        }
    }
    ctx.stroke();
    
    // Draw equation label and range info
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('y² = x³ - 3x + 3', 10, 20);
    
    // Show current range
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#666';
    const rangeText = `범위: x[${vals.xMin.toFixed(1)}, ${vals.xMax.toFixed(1)}] y[${vals.yMin.toFixed(1)}, ${vals.yMax.toFixed(1)}]`;
    ctx.fillText(rangeText, 10, 35);
    
    ctx.restore();
}

/**
 * Draw a point on the canvas
 * @param vals {PreCalcVals}
 * @param label {string}
 * @param P {Point}
 * @param color {string}
 */
function plotPoint(vals, label, P, color = 'red') {
    const ctx = vals.ctx;
    
    // Check if point is within visible range
    if (P.x < vals.xMin || P.x > vals.xMax || P.y < vals.yMin || P.y > vals.yMax) {
        console.log(`Point ${label} (${P.x.toFixed(2)}, ${P.y.toFixed(2)}) is out of range`);
        return;
    }
    
    const pt = pointToCtx(vals, P.x, P.y);
    
    // Draw point
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], vals.dotRadius + 1, 0, TWO_PI);
    ctx.stroke();
    ctx.fill();
    
    // Draw label with background for better visibility
    ctx.font = 'bold 12px sans-serif';
    const labelWidth = ctx.measureText(label).width;
    
    // White background for label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(pt[0] + 5, pt[1] - 15, labelWidth + 4, 14);
    
    // Label text
    ctx.fillStyle = color;
    ctx.fillText(label, pt[0] + 7, pt[1] - 5);
    ctx.restore();
}

/**
 * Adaptive manual add demo for real curve
 * @param ctx {CanvasRenderingContext2D}
 * @param pointsToShow {Array} array of {n, label} objects
 */
async function runAdaptiveDemo(ctx, pointsToShow = []) {
    const P = curve.P();
    
    // Calculate all points that need to be shown
    const allPoints = [];
    let currentPoint = P;
    
    // Add base point
    allPoints.push(P);
    
    // Calculate nP for each requested point
    const calculatedPoints = {};
    pointsToShow.forEach(item => {
        if (item.n > 1) {
            let point = P;
            for (let i = 2; i <= item.n; i++) {
                point = curve.add(point, P);
                if (i === item.n) {
                    calculatedPoints[item.n] = point;
                    if (point && !isNaN(point.x) && !isNaN(point.y)) {
                        allPoints.push(point);
                    }
                }
            }
        }
    });
    
    // Calculate adaptive dimensions
    const dimensions = calculateAdaptiveDimensions(allPoints, 0.15);
    const vals = preCalcValues(ctx, dimensions);
    
    // Draw curve with adaptive range
    await drawCurve(ctx, dimensions);
    
    // Plot all requested points
    plotPoint(vals, 'P', P, '#4F7CAC');
    
    pointsToShow.forEach(item => {
        if (item.n > 1 && calculatedPoints[item.n]) {
            const point = calculatedPoints[item.n];
            plotPoint(vals, item.label || `${item.n}P`, point, item.color || '#D4A574');
        }
    });
    
    return { dimensions, points: calculatedPoints };
}

/**
 * Animate point addition with adaptive range
 */
async function animatePointAddition(ctx, n1, n2) {
    const P = curve.P();
    
    // Calculate points
    let P1 = P, P2 = P;
    for (let i = 2; i <= n1; i++) {
        P1 = curve.add(P1, P);
    }
    for (let i = 2; i <= n2; i++) {
        P2 = curve.add(P2, P);
    }
    
    const R = curve.add(P1, P2);
    
    // Collect all points for range calculation
    const allPoints = [P, P1, P2];
    if (R && !isNaN(R.x) && !isNaN(R.y)) {
        allPoints.push(R);
        // Also add the negated intermediate point for visualization
        const negR = curve.negate(R);
        allPoints.push(negR);
    }
    
    // Calculate adaptive dimensions
    const dimensions = calculateAdaptiveDimensions(allPoints, 0.2);
    const vals = preCalcValues(ctx, dimensions);
    
    // Draw curve
    await drawCurve(ctx, dimensions);
    
    // Plot points
    plotPoint(vals, `${n1}P`, P1, '#4F7CAC');
    plotPoint(vals, `${n2}P`, P2, '#10B981');
    
    // Draw line through points
    if (R && !isNaN(R.x)) {
        ctx.save();
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        const m = curve.slope(P1, P2);
        // Extend line across visible canvas
        if (Math.abs(m) !== Infinity) {
            const y1 = P1.y + m * (vals.xMin - P1.x);
            const y2 = P1.y + m * (vals.xMax - P1.x);
            ctx.moveTo(...pointToCtx(vals, vals.xMin, y1));
            ctx.lineTo(...pointToCtx(vals, vals.xMax, y2));
        } else {
            // Vertical line
            ctx.moveTo(...pointToCtx(vals, P1.x, vals.yMin));
            ctx.lineTo(...pointToCtx(vals, P1.x, vals.yMax));
        }
        ctx.stroke();
        
        // Show negated point
        const negR = curve.negate(R);
        plotPoint(vals, '-R', negR, 'orange');
        
        // Draw vertical line to result
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(...pointToCtx(vals, R.x, negR.y));
        ctx.lineTo(...pointToCtx(vals, R.x, R.y));
        ctx.stroke();
        
        // Plot result
        plotPoint(vals, `${n1+n2}P`, R, '#D4A574');
        
        ctx.restore();
    }
    
    return { dimensions, result: R };
}

export {
    calculateAdaptiveDimensions,
    drawCurve,
    plotPoint,
    runAdaptiveDemo,
    animatePointAddition
};