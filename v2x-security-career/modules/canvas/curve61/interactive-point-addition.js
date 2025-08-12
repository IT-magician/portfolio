// Interactive Point Addition for Curve73
// 사용자가 두 점을 선택하면 덧셈 결과를 보여줌
// 참고: 73개의 점을 가진 타원곡선 (좌표는 mod 61)

import * as curve from './curve.js';
import * as field from './field.js';
import * as common from '../common.js';
import * as misc from './draw-misc.js';

const TWO_PI = 2*Math.PI;

/**
 * 미리 계산된 모든 점들 (1P ~ 73P)
 */
let allPoints = null;

function getAllPoints() {
    if (!allPoints) {
        allPoints = {};
        const P = curve.P();
        let Q = P;
        for (let i = 1; i <= 73; i++) {
            allPoints[i] = Q ? {...Q} : null;
            Q = curve.pointAdd(Q, P);
        }
    }
    return allPoints;
}

/**
 * n번째 점 또는 좌표로 점 찾기
 * @param {number|string|object} input - nP 형태의 숫자, "x,y" 형태의 문자열, 또는 {x,y} 객체
 * @returns {{n: number, point: object}|null}
 */
function findPoint(input) {
    const points = getAllPoints();
    
    // 숫자인 경우 (n번째 점)
    if (typeof input === 'number') {
        // mod 73 처리 (음수도 올바르게 처리)
        let n = ((input % 73) + 73) % 73;
        if (n === 0) n = 73;  // 0은 73(무한원점)으로 매핑
        return { n, point: points[n] };
    }
    
    // 문자열인 경우 "nP" 또는 "x,y" 형태
    if (typeof input === 'string') {
        // "nP" 형태 체크
        const pMatch = input.match(/^(\d+)[Pp]?$/);
        if (pMatch) {
            const n = parseInt(pMatch[1]);
            return findPoint(n);
        }
        
        // "x,y" 또는 "(x,y)" 형태 체크
        const coordMatch = input.match(/^\s*\(?\s*(\d+)\s*,\s*(\d+)\s*\)?\s*$/);
        if (coordMatch) {
            const x = parseInt(coordMatch[1]) % field.p;
            const y = parseInt(coordMatch[2]) % field.p;
            
            // 해당 좌표를 가진 점 찾기
            for (let [n, point] of Object.entries(points)) {
                if (point && point.x === x && point.y === y) {
                    return { n: parseInt(n), point };
                }
            }
        }
    }
    
    // 객체인 경우 {x, y}
    if (typeof input === 'object' && input.x !== undefined && input.y !== undefined) {
        const x = input.x % field.p;
        const y = input.y % field.p;
        
        for (let [n, point] of Object.entries(points)) {
            if (point && point.x === x && point.y === y) {
                return { n: parseInt(n), point };
            }
        }
    }
    
    return null;
}

/**
 * preCalcValues 헬퍼
 */
function preCalcValues(ctx) {
    const marginWide = 25;
    const marginThin = 14;
    const dotRadius = 3;
    const w = ctx.canvas.getBoundingClientRect().width;
    const h = ctx.canvas.getBoundingClientRect().height;
    return {
        ctx, marginWide, marginThin, w, h, dotRadius,
        wScale: (w-marginWide-marginThin)/field.p,
        hScale: (h-marginWide-marginThin)/field.p
    };
}

/**
 * 좌표 변환
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

/**
 * 점 그리기
 */
function drawDot(vals, x, y, color, radiusAdj = 0, lw = 1) {
    const ctx = vals.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    const p = pointToCtx(vals, x, y, true);
    ctx.arc(...p, vals.dotRadius + radiusAdj, 0, TWO_PI);
    if (lw !== 0) {
        ctx.stroke();
    }
    ctx.fill();
    ctx.restore();
    return p;
}

/**
 * 그리드와 축 그리기
 */
function drawGrid(ctx) {
    const vals = preCalcValues(ctx);
    const canvas = ctx.canvas;
    
    // Clear
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grey lines
    ctx.strokeStyle = 'lightgrey';
    ctx.lineWidth = 1;
    
    // Horizontal lines
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
    
    // Vertical lines
    for (let i = 5; i < field.p; i += 5) {
        ctx.setLineDash([]);
        ctx.beginPath();
        if (i % 10 !== 0) {
            ctx.setLineDash([2, 2]);
        }
        ctx.moveTo(...pointToCtx(vals, i, 0, true));
        ctx.lineTo(...pointToCtx(vals, i, field.p, true));
        ctx.stroke();
    }
    
    // Axis lines
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';
    ctx.moveTo(...pointToCtx(vals, 0, 0, true));
    ctx.lineTo(...pointToCtx(vals, field.p, 0, true));
    ctx.moveTo(...pointToCtx(vals, 0, 0, true));
    ctx.lineTo(...pointToCtx(vals, 0, field.p, true));
    ctx.stroke();
    
    // Labels
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
}

/**
 * 곡선 위의 모든 점 그리기
 */
function drawCurvePoints(ctx) {
    const vals = preCalcValues(ctx);
    ctx.save();
    ctx.fillStyle = 'lightblue';
    for (let x = 0; x < field.p; x++) {
        let yVals = curve.Y(x);
        if (yVals) {
            drawDot(vals, x, yVals[0], 'lightblue', -1, 0);
            drawDot(vals, x, yVals[1], 'lightblue', -1, 0);
        }
    }
    ctx.restore();
}

/**
 * 애니메이션과 함께 점 덧셈 표시
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} pointP - 첫 번째 점 {n, point}
 * @param {object} pointQ - 두 번째 점 {n, point}
 * @param {object} options - 애니메이션 옵션
 * @returns {Promise} 애니메이션 완료 Promise
 */
function showPointAdditionWithAnimation(ctx, pointP, pointQ, options = {}) {
    return new Promise((resolve) => {
        const vals = preCalcValues(ctx);
        
        if (!pointP || !pointQ) {
            resolve(null);
            return;
        }
        
        const P = pointP.point;
        const Q = pointQ.point;
        
        // 점 덧셈 계산
        const R = curve.pointAdd(P, Q);
        
        // slope 계산 - 원본과 동일하게 misc.getSlope 사용
        const slope = misc.getSlope(P, Q);
        
        const negR = R ? curve.negate(R) : null;
        
        // 애니메이션 상태
        const duration = {
            tangent: 800,    // 접선 그리기
            tanPause: 200,   // 잠시 멈춤
            line: 1200,      // 선 그리기
            linePause: 800,  // negR 도착 후 멈춤 (300 -> 800ms로 증가)
            negate: 600,     // 대칭 이동
            done: 500        // 완료 표시
        };
        
        const finished = {};
        const cache = {};
        let startTime = null;
        let animationId = null;
        let cancelled = false;
        let prevTimestamp = null;
        
        // 애니메이션 취소 함수
        const cancelAnimation = () => {
            cancelled = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
        
        function animate(timestamp) {
            if (cancelled) return;
            
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            // 그리드와 곡선 다시 그리기
            drawGrid(ctx);
            drawCurvePoints(ctx);
            
            // P, Q 점 표시
            if (P) {
                const pPos = drawDot(vals, P.x, P.y, '#4F7CAC', 2, 2);
                ctx.save();
                ctx.fillStyle = '#4F7CAC';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(`${pointP.n}P`, pPos[0] + 10, pPos[1] - 10);
                ctx.restore();
            }
            
            if (Q && Q !== P) {
                const qPos = drawDot(vals, Q.x, Q.y, '#10B981', 2, 2);
                ctx.save();
                ctx.fillStyle = '#10B981';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(`${pointQ.n}P`, qPos[0] + 10, qPos[1] - 10);
                ctx.restore();
            }
            
            // 무한원점 처리
            if (R === null) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fillRect(vals.w / 2 - 80, vals.h / 2 - 40, 160, 80);
                
                ctx.fillStyle = 'red';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('∞', vals.w / 2, vals.h / 2);
                
                ctx.fillStyle = '#333';
                ctx.font = 'bold 16px monospace';
                ctx.fillText('73P = O', vals.w / 2, vals.h / 2 + 30);
                ctx.restore();
                
                resolve({ n: 73, point: null });
                return;
            }
            
            // 애니메이션 단계별 처리
            if (!finished.tangent) {
                // P와 Q를 지나는 점선 그리기
                const progress = Math.min(elapsed / duration.tangent, 1);
                const mult = common.easeInOut(progress);
                
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'orange';
                ctx.setLineDash([4, 4]);
                
                const bounds = misc.lineBoxBounds(P, Q);
                
                // P와 Q를 x좌표 순으로 정렬
                const [leftPoint, rightPoint] = P.x <= Q.x ? [P, Q] : [Q, P];
                
                // 양쪽 끝으로 연장
                const leftExtend = (leftPoint.x - bounds[0]) * mult;
                const rightExtend = (bounds[1] - rightPoint.x) * mult;
                
                // 하나의 연속된 선으로 그리기
                ctx.moveTo(...pointToCtx(vals, leftPoint.x - leftExtend,
                    leftPoint.y - leftExtend * slope));
                ctx.lineTo(...pointToCtx(vals, rightPoint.x + rightExtend,
                    rightPoint.y + rightExtend * slope));
                
                ctx.stroke();
                ctx.restore();
                
                if (progress >= 1) finished.tangent = true;
                
            } else if (!finished.line && elapsed > duration.tangent + duration.tanPause) {
                // 교점까지 선 그리기 - 누적 방식으로 변경
                if (negR) {
                    // 캐시 초기화 (첫 프레임에만)
                    if (!cache.lineLastP) {
                        // P와 Q 중 x좌표가 작은 점부터 시작 (원본과 동일)
                        let orderedQ;
                        [cache.lineLastP, orderedQ] = common.orderPointsByX(P, Q);
                        cache.lineXLeft = misc.findTotalXLength(P, Q, negR);
                        cache.lineXPerMs = cache.lineXLeft / duration.line || 1;
                        cache.segmentBudget = 5;
                        cache.allSegments = []; // 모든 세그먼트 저장
                    }
                    
                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'orange';
                    ctx.setLineDash([]);
                    
                    // 이전에 그린 모든 세그먼트 다시 그리기 (누적 효과)
                    cache.allSegments.forEach(seg => {
                        ctx.beginPath();
                        ctx.moveTo(...pointToCtx(vals, seg.from.x, seg.from.y));
                        ctx.lineTo(...pointToCtx(vals, seg.to.x, seg.to.y));
                        ctx.stroke();
                    });
                    
                    // 이번 프레임에 새로 그릴 세그먼트
                    let todoX = Math.min(cache.lineXPerMs * (timestamp - prevTimestamp), cache.lineXLeft);
                    let check = 10;
                    let segmentsLen = 0;
                    
                    const EPS = 0.0000001;
                    
                    // 새로운 세그먼트 그리고 저장
                    while (todoX > 0 && segmentsLen < cache.segmentBudget) {
                        if (check-- < 0) break;
                        
                        const startPoint = {...cache.lineLastP};
                        const next = misc.findWrapSegment(cache.lineLastP, slope, todoX,
                            cache.segmentBudget - segmentsLen);
                        
                        // 새 세그먼트 그리기
                        ctx.beginPath();
                        ctx.moveTo(...pointToCtx(vals, startPoint.x, startPoint.y));
                        ctx.lineTo(...pointToCtx(vals, next.x, next.y));
                        ctx.stroke();
                        
                        // 세그먼트 저장
                        cache.allSegments.push({
                            from: startPoint,
                            to: {...next}
                        });
                        
                        segmentsLen += misc.segmentLen(cache.lineLastP, next);
                        
                        const drawnX = next.x - cache.lineLastP.x;
                        
                        // wrap around 처리 (원본과 동일)
                        if (next.y < EPS) {
                            next.y += field.p;
                            cache.segmentBudget *= 1.1;
                        } else if (next.y > field.p - EPS) {
                            next.y -= field.p;
                            cache.segmentBudget *= 1.1;
                        }
                        if (next.x > field.p - EPS) {
                            next.x -= field.p;
                            cache.segmentBudget *= 1.1;
                        }
                        
                        cache.lineLastP = next;
                        cache.lineXLeft -= drawnX;
                        todoX -= drawnX;
                    }
                    
                    // 완료 시 negR 점 표시
                    if (cache.lineXLeft <= EPS) {
                        drawDot(vals, negR.x, negR.y, 'orange', 1, 1);
                        finished.line = true;
                    }
                    
                    ctx.restore();
                }
                
            } else if (!finished.linePause && elapsed > duration.tangent + duration.tanPause + duration.line) {
                // negR 도착 후 대기 및 깜빡임 효과
                const pauseStart = duration.tangent + duration.tanPause + duration.line;
                const pauseElapsed = elapsed - pauseStart;
                
                if (negR) {
                    // 깜빡임 효과 (100ms 간격으로 on/off)
                    const blinkInterval = 100;
                    const blinkCount = Math.floor(pauseElapsed / blinkInterval);
                    const isVisible = blinkCount % 2 === 0;
                    
                    if (isVisible) {
                        // 빨간색으로 강조
                        drawDot(vals, negR.x, negR.y, 'red', 2, 2);
                    } else {
                        // 원래 색상
                        drawDot(vals, negR.x, negR.y, 'orange', 1, 1);
                    }
                }
                
                if (pauseElapsed >= duration.linePause) {
                    finished.linePause = true;
                }
                
            } else if (!finished.negate && finished.linePause) {
                // 대칭 이동
                const negateStart = duration.tangent + duration.tanPause + duration.line + duration.linePause;
                const progress = Math.min((elapsed - negateStart) / duration.negate, 1);
                
                if (negR) {
                    // negR 표시 (깜빡임 종료 후 원래 색상)
                    drawDot(vals, negR.x, negR.y, 'orange', 1, 1);
                    
                    // 수직선
                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'red';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    
                    const midY = negR.y + (R.y - negR.y) * progress;
                    ctx.moveTo(...pointToCtx(vals, negR.x, negR.y));
                    ctx.lineTo(...pointToCtx(vals, R.x, midY));
                    ctx.stroke();
                    
                    if (progress > 0.5) {
                        drawDot(vals, R.x, R.y, '#D4A574', 2, 2);
                    }
                    ctx.restore();
                }
                
                if (progress >= 1) finished.negate = true;
                
            } else if (finished.negate || elapsed > 4000) {
                // 최종 결과 표시 - 모든 요소 유지
                
                // 그리드와 곡선 다시 그리기 (깨끗한 상태)
                drawGrid(ctx);
                drawCurvePoints(ctx);
                
                // P 점
                if (P) {
                    const pPos = drawDot(vals, P.x, P.y, '#4F7CAC', 2, 2);
                    ctx.save();
                    ctx.fillStyle = '#4F7CAC';
                    ctx.font = 'bold 12px monospace';
                    ctx.fillText(`${pointP.n}P`, pPos[0] + 10, pPos[1] - 10);
                    ctx.restore();
                }
                
                // Q 점
                if (Q && Q !== P) {
                    const qPos = drawDot(vals, Q.x, Q.y, '#10B981', 2, 2);
                    ctx.save();
                    ctx.fillStyle = '#10B981';
                    ctx.font = 'bold 12px monospace';
                    ctx.fillText(`${pointQ.n}P`, qPos[0] + 10, qPos[1] - 10);
                    ctx.restore();
                }
                
                // negR 점
                if (negR) {
                    drawDot(vals, negR.x, negR.y, 'orange', 1, 1);
                }
                
                // 빨간색 수직 점선
                if (negR && R) {
                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'red';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(...pointToCtx(vals, negR.x, negR.y));
                    ctx.lineTo(...pointToCtx(vals, R.x, R.y));
                    ctx.stroke();
                    ctx.restore();
                }
                
                // R 점 (결과)
                const points = getAllPoints();
                let resultN = 0;
                for (let [n, point] of Object.entries(points)) {
                    if (point && point.x === R.x && point.y === R.y) {
                        resultN = parseInt(n);
                        break;
                    }
                }
                
                const rPos = drawDot(vals, R.x, R.y, '#D4A574', 3, 2);
                ctx.save();
                ctx.fillStyle = '#D4A574';
                ctx.font = 'bold 14px monospace';
                ctx.fillText(`${resultN}P`, rPos[0] + 10, rPos[1] - 10);
                ctx.restore();
                
                // 애니메이션 종료
                cancelled = true;
                resolve({ n: resultN, point: R });
                return;
            }
            
            prevTimestamp = timestamp;  // 다음 프레임을 위해 저장
            animationId = requestAnimationFrame(animate);
        }
        
        // 에러 처리를 위한 try-catch
        try {
            animationId = requestAnimationFrame(animate);
        } catch (error) {
            console.error('Animation error:', error);
            resolve({ n: 0, point: null });
        }
        
        // 취소 함수 반환 (필요시 외부에서 사용)
        return { promise: resolve, cancel: cancelAnimation };
    });
}

/**
 * Interactive 점 덧셈 표시 (애니메이션 없는 버전)
 */
function showPointAddition(ctx, pointP, pointQ, options = {}) {
    const vals = preCalcValues(ctx);
    
    // 그리드와 곡선 그리기
    drawGrid(ctx);
    drawCurvePoints(ctx);
    
    if (!pointP || !pointQ) return null;
    
    const P = pointP.point;
    const Q = pointQ.point;
    
    // 점 덧셈 계산
    const R = curve.pointAdd(P, Q);
    
    // P 점 표시 (파란색)
    if (P) {
        const pPos = drawDot(vals, P.x, P.y, '#4F7CAC', 2, 2);
        ctx.save();
        ctx.fillStyle = '#4F7CAC';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${pointP.n}P (${P.x},${P.y})`, pPos[0] + 10, pPos[1] - 10);
        ctx.restore();
    }
    
    // Q 점 표시 (초록색)
    if (Q && Q !== P) {
        const qPos = drawDot(vals, Q.x, Q.y, '#10B981', 2, 2);
        ctx.save();
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${pointQ.n}P (${Q.x},${Q.y})`, qPos[0] + 10, qPos[1] - 10);
        ctx.restore();
    }
    
    // 결과 R 표시
    if (R === null) {
        // 무한원점
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(vals.w / 2 - 80, vals.h / 2 - 40, 160, 80);
        
        ctx.fillStyle = 'red';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('∞', vals.w / 2, vals.h / 2);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('73P = O', vals.w / 2, vals.h / 2 + 30);
        ctx.restore();
        
        return { n: 73, point: null };
    } else {
        // 결과 점
        const rPos = drawDot(vals, R.x, R.y, '#D4A574', 3, 2);
        
        // 결과 n 찾기
        const points = getAllPoints();
        let resultN = 0;
        for (let [n, point] of Object.entries(points)) {
            if (point && point.x === R.x && point.y === R.y) {
                resultN = parseInt(n);
                break;
            }
        }
        
        ctx.save();
        ctx.fillStyle = '#D4A574';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`${resultN}P (${R.x},${R.y})`, rPos[0] + 10, rPos[1] - 10);
        
        // 덧셈 수식 표시
        ctx.fillStyle = '#333';
        ctx.font = '14px monospace';
        ctx.fillText(`${pointP.n}P + ${pointQ.n}P = ${resultN}P`, 20, 30);
        ctx.restore();
        
        return { n: resultN, point: R };
    }
}

export {
    getAllPoints,
    findPoint,
    showPointAddition,
    showPointAdditionWithAnimation,
    drawGrid,
    drawCurvePoints
};