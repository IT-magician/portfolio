// draw61의 복제 - 선 애니메이션 제거 버전
// 점만 표시하는 애니메이션

import * as curve from './curve.js';
import * as field from './field.js';
import * as misc from './draw-misc.js';
import * as common from '../common.js';

const TWO_PI = 2*Math.PI;
const EPS = 0.0000001;
const INFINITY = '\u221E';

function P() {
    return curve.P();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 * @return {PreCalcVals}
 */
function preCalcValues(ctx) {
    const marginWide = 25;
    const marginThin = 14;
    const dotRadius = 3;
    const ratio = ctx.canvas['_ratio'] || 1;
    // Use canvas internal dimensions instead of CSS dimensions
    const w = ctx.canvas.width / ratio;
    const h = ctx.canvas.height / ratio;
    return {
        ctx, marginWide, marginThin, w, h, dotRadius,
        wScale: (w-marginWide-marginThin)/field.p,
        hScale: (h-marginWide-marginThin)/field.p
    };
}

/**
 * Given an x,y point in the field Fp return the coordinates transformed for the JS Canvas context
 * (adjusted for top-left origin and half-pixel anti-aliasing)
 *
 * @param vals {PreCalcVals}
 * @param x {Number} between 0 and p
 * @param y {Number} between 0 and p
 * @param halfPixel {Boolean?} if set, round all pixels to nearest .5 (true) or .0 (false)
 * @return {Number[2]} x,y values transformed for canvas context
 */
function pointToCtx(vals, x, y, halfPixel) {
    let v = [vals.marginWide + x*vals.wScale, vals.h - (vals.marginWide + y*vals.hScale)];
    if (halfPixel) {
        v[0] = ((v[0]+0.5) | 0) - 0.5;
        v[1] = ((v[1]+0.5) | 0) - 0.5;
    } else if (halfPixel === false) {
        v[0] = ((v[0]+0.5) | 0);
        v[1] = ((v[1]+0.5) | 0);
    }
    return v;
}

let drawGreyLines = (ctx, vals) => {
    const greyWidth = 5;
    ctx.strokeStyle = 'lightgrey';
    [field.p/2, field.p].forEach(y => {
        ctx.setLineDash([]);
        ctx.beginPath();
        if (y !== field.p) {
            ctx.setLineDash([2, 2]);
        }
        ctx.moveTo(...pointToCtx(vals, 0, y, true));
        ctx.lineTo(...pointToCtx(vals, field.p-1, y, true));
        ctx.stroke();
    });
    for (let i = greyWidth; i < field.p; i += greyWidth) {
        ctx.setLineDash([]);
        ctx.beginPath();
        if (i % 10 !== 0) {
            ctx.setLineDash([2, 2]);
        }
        ctx.moveTo(...pointToCtx(vals, i, 0, true));
        ctx.lineTo(...pointToCtx(vals, i, field.p, true));
        ctx.stroke();
    }
};

let drawAxisLines = (ctx, vals) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(...pointToCtx(vals, 0, 0, true));
    ctx.lineTo(...pointToCtx(vals, field.p, 0, true));
    ctx.moveTo(...pointToCtx(vals, 0, 0, true));
    ctx.lineTo(...pointToCtx(vals, 0, field.p, true));
    ctx.stroke();
    ctx.font = 'italic 12px serif';
    ctx.fillStyle = 'black';
    const yBodge = 12 / vals.hScale;
    [10, 20, 30, 40, 50].forEach(x => {
        ctx.fillText(x, ...pointToCtx(vals, x-1, -yBodge));
    });
    ctx.fillText('73', ...pointToCtx(vals, field.p - 0.5, -yBodge, false));
    ctx.textAlign = 'right';
    const xBodge = 4 / vals.wScale;
    ctx.fillText('0', ...pointToCtx(vals, -xBodge, -yBodge, false));
    ctx.fillText('73', ...pointToCtx(vals, -xBodge, field.p - 0.5, false));
    ctx.fillText('36', ...pointToCtx(vals, -xBodge, field.p/2 - 0.5, false));
    ctx.restore();
};

/**
 * Draw the curve points (원본과 동일)
 */
function drawCurve(ctx) {
    const vals = preCalcValues(ctx);
    ctx.save();
    ctx.fillStyle = 'lightblue';
    for (let x = 0; x < field.p; x++) {
        let yVals = curve.Y(x);
        if (yVals) {
            drawDot(vals, x, yVals[0], 'lightblue');
            drawDot(vals, x, yVals[1], 'lightblue');
        }
    }
    ctx.restore();
}

/**
 * @param vals {PreCalcVals}
 * @param x {Number} coordinate
 * @param y {Number} coordinate
 * @param color {String} fill style
 * @param radiusAdj {Number?} adjustment to built-in dot radius
 * @param lw {Number?} line width
 * @return {Number[2]} x,y (in canvas context) of center of dot
 */
function drawDot(vals, x, y, color, radiusAdj, lw) {
    const ctx = vals.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = color;
    ctx.lineWidth = lw || 1;
    const p = pointToCtx(vals, x, y, true);
    ctx.arc(...p, vals.dotRadius + (radiusAdj || 0), 0, TWO_PI);
    if (lw !== 0) {
        ctx.stroke();
    }
    ctx.fill();
    ctx.beginPath();
    ctx.restore();
    return p;
}

/**
 * @param ctx {CanvasRenderingContext2D}
 * @param vals {PreCalcVals}
 * @param n {Number} label for the point
 * @param point {Point} the point to label
 * @param labelOptions {Object?}
 */
function labelPoint(ctx, vals, n, point, labelOptions) {
    // 점은 항상 orange로 표시
    const color = 'orange';
    const p = drawDot(vals, point.x, point.y, color);
    
    // 현재 계산 중인 점인 경우에만 라벨 표시
    if (labelOptions?.showLabel) {
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace';
        
        const dir = common.pickLabelDirection ? 
            common.pickLabelDirection(ctx, p[0], p[1]) : [1, -1];
        
        ctx.textAlign = dir[0] === -1 ? 'right' : 'left';
        ctx.textBaseline = dir[1] === -1 ? 'bottom' : 'top';
        
        const label = n === 1 && labelOptions?.label ? labelOptions.label : `${n}P`;
        ctx.fillText(label, p[0] + 5*dir[0], p[1] + 5*dir[1]);
        ctx.restore();
    }
}

/**
 * Reset the graph to defaults (원본 구조 유지)
 * @param ctx {CanvasRenderingContext2D}
 * @param drawPoints {Boolean} if true draw the curve
 */
async function resetGraph(ctx, drawPoints) {
    const canvas = ctx.canvas;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    const vals = preCalcValues(ctx);
    ctx.lineWidth = 1;
    drawGreyLines(ctx, vals);
    drawAxisLines(ctx, vals);
    
    // Draw curve points if requested
    if (drawPoints) {
        drawCurve(ctx);
    }
}

/**
 * Draw and label several points
 * @param ctx {CanvasRenderingContext2D}
 * @param vals {PreCalcVals}
 * @param nPs {Object} list of {label: Point} items
 * @param labelOptions {Object?}
 */
function drawAndLabelPoints(ctx, vals, nPs, labelOptions) {
    ctx.save();
    for (const [n, point] of Object.entries(nPs || {})) {
        // 1P는 labels에 있을 때만 표시 (자기 차례일 때만)
        if (point && point !== null) {
            labelPoint(ctx, vals, n, point, labelOptions);
        }
    }
    ctx.restore();
}

/**
 * 선 애니메이션 없이 점 추가만 하는 버전
 * @param ctx
 * @param nP {Number} the base-P multiple of P (for labeling)
 * @param P {Point} the current point 'P'
 * @param nQ {Number} the base-P multiple of Q (for labeling)
 * @param Q {Point} the current point 'Q' to add to P
 * @param options {Object?} optional list of options
 * @return {Point} the result of adding P and Q: R
 */
function addPointsNoAnimation(ctx, nP, P, nQ, Q, options) {
    const vals = preCalcValues(ctx);
    const labelOptions = {coords: options?.coords, label: options?.basePointLabel};
    
    if (Q === undefined) {
        Q = P;
        nQ = nP;
    } else if (Q === null) {
        // reset back to P
        const R = P;
        resetGraph(ctx, options?.drawPoints);
        drawAndLabelPoints(ctx, vals, options?.labels, {label: options?.basePointLabel});
        drawDot(vals, P.x, P.y, 'red');
        if (options?.drawDoneCb) {
            setTimeout(() => options.drawDoneCb(nP+nQ, R), 0);
        }
        return P;
    }
    
    const R = curve.pointAdd(P, Q);
    
    // 무한원점 처리
    if (R === null) {
        console.log(`Infinity point reached at ${nP}P + ${nQ}P = ${nP+nQ}P`);
        resetGraph(ctx, options?.drawPoints);
        drawAndLabelPoints(ctx, vals, options?.labels, labelOptions);
        
        // 무한원점 표시
        ctx.save();
        // 배경 추가 (선택사항)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(vals.w / 2 - 60, vals.h / 2 - 30, 120, 70);
        
        // 무한 기호
        ctx.fillStyle = 'red';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(INFINITY, vals.w / 2, vals.h / 2);
        
        // 좌표 표시 - 더 명확하게
        ctx.fillStyle = '#333';  // 진한 회색
        ctx.font = 'bold 16px monospace';
        ctx.fillText('(NaN, NaN)', vals.w / 2, vals.h / 2 + 28);
        ctx.restore();
        
        if (options?.drawDoneCb) {
            setTimeout(() => options.drawDoneCb(nP+nQ, R), 0);
        }
        return R;
    }
    
    // 즉시 결과 점 표시 (애니메이션 없이, negR 표시 없이)
    resetGraph(ctx, options?.drawPoints);
    drawAndLabelPoints(ctx, vals, options?.labels, labelOptions);
    
    // 결과 점 R 표시 및 현재 계산 중인 점 라벨 표시
    const p = drawDot(vals, R.x, R.y, 'orange');
    
    // 현재 계산 중인 점에만 좌표 라벨 표시
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.font = 'bold 12px monospace';
    
    const dir = common.pickLabelDirection ? 
        common.pickLabelDirection(ctx, p[0], p[1]) : [1, -1];
    
    ctx.textAlign = dir[0] === -1 ? 'right' : 'left';
    ctx.textBaseline = dir[1] === -1 ? 'bottom' : 'top';
    
    ctx.fillText(`(${R.x}, ${R.y})`, p[0] + 5*dir[0], p[1] + 5*dir[1]);
    ctx.restore();
    
    if (options?.drawDoneCb) {
        setTimeout(() => options.drawDoneCb(nP+nQ, R), 0);
    }
    
    return R;
}

/**
 * 점만 표시하는 AddP 데모
 * @param ctx
 * @param nQ {Number?} optional nP value of Q
 * @param Q {Point?} optional starting point
 * @param updateCb {Function?} callback after each point
 * @param drawDoneCb {Function?} callback after each draw
 */
async function runAddPDemoPointsOnly(ctx, nQ, Q, updateCb, drawDoneCb) {
    resetGraph(ctx, true);
    const labels = {}; // 누적된 점들 저장
    
    let next = async () => {
        // 1P는 첫 번째 계산(nQ=1)일 때만 labels에 추가
        const currentLabels = nQ === 1 ? {1: curve.P()} : {...labels};
        
        Q = addPointsNoAnimation(ctx, 1, curve.P(), nQ, Q, {
            coords: false,  // 좌표 표시 비활성화
            labels: currentLabels,
            drawPoints: true,
            drawDoneCb: (nR, R) => {
                // 결과를 labels에 추가
                if (R !== null) {
                    labels[nR] = R;
                }
                // 무한원점은 labels에 추가하지 않음 (표시만 함)
                
                if (drawDoneCb) drawDoneCb(nR, R);
                if (common.canvasIsScrolledIntoView(ctx.canvas)) {
                    // 무한원점일 때는 더 오래 표시
                    const delay = (R === null) ? 2000 : 500;
                    ctx['_timeout'] = setTimeout(() => { next() }, delay);
                    return true;
                } else {
                    ctx.canvas.click();
                    return false;
                }
            }
        });
        nQ++;
        // 73P에서 리셋 (73개 점의 순환군, 73P = 무한원점)
        // 참고: Curve61은 p=61인 유한체를 사용하지만 실제 점은 73개
        if (nQ > 73) {
            nQ = 1;
            Q = undefined;
            // labels 초기화
            Object.keys(labels).forEach(key => delete labels[key]);
        }
        if (updateCb) updateCb(nQ, Q);
    };
    await next();
}

export {
    INFINITY,
    P,
    resetGraph,
    runAddPDemoPointsOnly,
    addPointsNoAnimation,
    drawAndLabelPoints,
    preCalcValues,
    labelPoint
};