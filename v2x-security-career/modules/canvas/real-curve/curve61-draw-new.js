import * as curve from './curve61-real-new.js';
import * as common from '../common.js';
const TWO_PI = 2 * Math.PI;

// y² = x³ - x + 1 곡선, G=(1,1)에서 8P까지 표시
// x,y 축 범위 동일하게 설정하여 그래프 변형 방지
let dimensions = {xMin: -3, xMax: 7, yMin: -3, yMax: 7}; 
const curveColor = '#33f';

/**
 * @param ctx {CanvasRenderingContext2D}
 * @return {PreCalcVals}
 */
function preCalcValues(ctx) {
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
 * (adjusted for top-left origin and half-pixel anti-aliasing)
 *
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
 * Draw the curve on the canvas
 * @param ctx {CanvasRenderingContext2D}
 */
async function drawCurve(ctx) {
    const vals = preCalcValues(ctx);
    
    // Clear canvas
    ctx.clearRect(0, 0, vals.w, vals.h);
    
    // Draw axes
    ctx.save();
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // x-axis
    ctx.moveTo(...pointToCtx(vals, vals.xMin, 0, true));
    ctx.lineTo(...pointToCtx(vals, vals.xMax, 0, true));
    // y-axis
    ctx.moveTo(...pointToCtx(vals, 0, vals.yMin, true));
    ctx.lineTo(...pointToCtx(vals, 0, vals.yMax, true));
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    // Vertical lines
    for (let x = Math.ceil(vals.xMin/5)*5; x <= vals.xMax; x += 5) {
        ctx.moveTo(...pointToCtx(vals, x, vals.yMin, true));
        ctx.lineTo(...pointToCtx(vals, x, vals.yMax, true));
    }
    // Horizontal lines
    for (let y = Math.ceil(vals.yMin/50)*50; y <= vals.yMax; y += 50) {
        ctx.moveTo(...pointToCtx(vals, vals.xMin, y, true));
        ctx.lineTo(...pointToCtx(vals, vals.xMax, y, true));
    }
    ctx.stroke();
    
    // Draw curve: y² = x³ - x + 1
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2;
    
    // Upper branch (positive y)
    ctx.beginPath();
    let started = false;
    for (let x = vals.xMin; x <= vals.xMax; x += 0.1) {
        const yVal = curve.y(x);
        if (!isNaN(yVal) && yVal !== undefined) {
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
    for (let x = vals.xMin; x <= vals.xMax; x += 0.1) {
        const yVal = curve.y(x);
        if (!isNaN(yVal) && yVal !== undefined) {
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
    
    // Draw equation label
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('y² = x³ - x + 1', 10, 20);
    
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
    const pt = pointToCtx(vals, P.x, P.y);
    
    // Draw point
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], vals.dotRadius, 0, TWO_PI);
    ctx.fill();
    
    // Draw label
    ctx.font = '12px sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, pt[0] + 5, pt[1] - 5);
    ctx.restore();
}

/**
 * Manual add demo for real curve
 */
async function runManualAddDemo(ctx, n, Q, updateCb) {
    const vals = preCalcValues(ctx);
    const P = curve.P();
    
    // Clear and redraw curve
    await drawCurve(ctx);
    
    // Calculate nP
    if (!Q) {
        Q = P;
        n = 1;
    }
    
    // Plot points
    plotPoint(vals, 'P', P, 'blue');
    if (n > 1) {
        plotPoint(vals, n + 'P', Q, 'red');
    }
    
    // Draw line through P and Q if n > 1
    if (n > 1 && Q) {
        ctx.save();
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        const m = curve.slope(P, Q);
        // Extend line across canvas
        const x1 = vals.xMin;
        const y1 = Q.y + m * (x1 - Q.x);
        const x2 = vals.xMax;
        const y2 = Q.y + m * (x2 - Q.x);
        
        ctx.moveTo(...pointToCtx(vals, x1, y1));
        ctx.lineTo(...pointToCtx(vals, x2, y2));
        ctx.stroke();
        ctx.restore();
    }
    
    return { n, Q };
}

export { drawCurve, runManualAddDemo, plotPoint, preCalcValues, pointToCtx };