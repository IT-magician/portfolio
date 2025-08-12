// Curve61 Promise 기반 동기화 컨트롤러
// 양쪽 캔버스 애니메이션을 동기화하여 한쪽이 먼저 끝나면 다른 쪽을 기다림

import * as draw61 from './draw.js';
import * as curve61 from './curve.js';
import * as common from '../common.js';

class SyncController {
    constructor() {
        this.leftCtx = null;
        this.rightCtx = null;
        this.leftModule = null;  // draw61
        this.rightModule = null; // real2
        
        // 현재 상태
        this.currentN = 1; // 1부터 시작 (P + P = 2P)
        this.leftQ = undefined;
        this.rightQ = null;
        
        // 애니메이션 진행 상태
        this.isRunning = false;
        this.isPaused = false;
        
        // Promise resolvers 저장
        this.leftResolver = null;
        this.rightResolver = null;
        
        // 애니메이션 속도 동기화를 위한 타이밍
        this.animationDuration = 3000; // 3초로 통일
        this.pauseBetweenSteps = 1500; // 단계 사이 대기 시간
    }
    
    /**
     * 컨트롤러 초기화
     */
    init(leftCtx, rightCtx, leftModule, rightModule) {
        this.leftCtx = leftCtx;
        this.rightCtx = rightCtx;
        this.leftModule = leftModule;
        this.rightModule = rightModule;
        
        console.log('SyncController initialized');
    }
    
    /**
     * 왼쪽 캔버스 애니메이션을 Promise로 래핑
     */
    async runLeftAnimation() {
        // draw61의 Promise 버전 사용
        const result = await this.leftModule.addPointsAnimationPromise(
            this.leftCtx,
            1, // nP
            curve61.P(), // P
            this.currentN, // nQ
            this.leftQ, // Q
            {
                coords: true,
                labels: {1: curve61.P()},
                drawDoneCb: (nR, R) => {
                    console.log(`Left animation completed: ${nR}P`, R);
                    this.leftQ = R;
                    return false; // 자동 진행 방지
                }
            }
        );
        
        this.leftQ = result.R;
        return result;
    }
    
    /**
     * 오른쪽 캔버스 애니메이션을 Promise로 래핑
     */
    runRightAnimation() {
        return new Promise(async (resolve) => {
            this.rightResolver = resolve;
            
            // real2 모듈의 경우 직접 addPoints 호출
            const vals = this.rightModule.preCalcValues(this.rightCtx);
            const P = this.rightModule.curve.P();
            
            // 캔버스 초기화
            await this.rightModule.drawCurve(this.rightCtx);
            this.rightModule.plotNPs(this.rightCtx, vals, 'black', ...common.range(1, this.currentN));
            
            // 방정식 표시
            this.rightModule.writeEquation(this.rightCtx, vals, 1, this.currentN, this.currentN + 1);
            
            // 애니메이션 실행
            const R = await this.rightModule.addPoints(
                this.rightCtx,
                1, // nP
                P, // P
                this.currentN, // nQ
                this.rightQ || P, // Q
                (nR, R) => {
                    // 결과 점 표시
                    this.rightModule.plotNPs(this.rightCtx, vals, 'red', nR);
                    console.log(`Right animation completed: ${nR}P`, R);
                    this.rightQ = R;
                }
            );
            
            // 애니메이션 완료 시 resolve
            if (this.rightResolver) {
                this.rightResolver({ nR: this.currentN + 1, R });
                this.rightResolver = null;
            }
        });
    }
    
    /**
     * 동기화된 애니메이션 단계 실행
     */
    async runSyncStep() {
        if (this.isRunning || this.isPaused) return;
        
        this.isRunning = true;
        
        console.log(`🔄 Starting synchronized step: P + ${this.currentN}P = ${this.currentN + 1}P`);
        
        try {
            // 왼쪽 그래프 초기화
            await this.leftModule.resetGraph(this.leftCtx, true);
            
            // 두 애니메이션을 동시에 시작하고 둘 다 완료될 때까지 기다림
            const [leftResult, rightResult] = await Promise.all([
                this.runLeftAnimation(),
                this.runRightAnimation()
            ]);
            
            console.log('✅ Both animations completed!', {
                left: leftResult,
                right: rightResult
            });
            
            // 다음 단계 준비
            this.currentN++;
            
            // 8P에 도달하면 리셋
            if (this.currentN >= 8) {
                console.log('🔄 Resetting to 1P');
                this.currentN = 1;
                this.leftQ = undefined;
                this.rightQ = null;
                
                // 리셋 후 대기
                await this.delay(this.pauseBetweenSteps * 2);
            } else {
                // 다음 단계 전 대기
                await this.delay(this.pauseBetweenSteps);
            }
            
        } catch (error) {
            console.error('Animation sync error:', error);
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * 연속 자동 실행
     */
    async runContinuous() {
        if (this.isPaused) return;
        
        while (!this.isPaused) {
            await this.runSyncStep();
            
            // 화면에 보이는 경우에만 계속 진행
            if (!common.canvasIsScrolledIntoView(this.leftCtx.canvas)) {
                this.pause();
                break;
            }
        }
    }
    
    /**
     * 애니메이션 시작
     */
    start() {
        this.isPaused = false;
        this.runContinuous();
    }
    
    /**
     * 애니메이션 일시정지
     */
    pause() {
        this.isPaused = true;
        
        // 진행 중인 애니메이션 취소
        if (this.leftCtx) {
            common.cancelAnimation(this.leftCtx);
        }
        if (this.rightCtx) {
            common.cancelAnimation(this.rightCtx);
        }
        
        console.log('⏸️ Animation paused');
    }
    
    /**
     * 리셋
     */
    reset() {
        this.pause();
        this.currentN = 1;
        this.leftQ = undefined;
        this.rightQ = null;
        this.isRunning = false;
        
        console.log('🔄 Controller reset');
    }
    
    /**
     * 유틸리티: 지연
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 싱글톤 인스턴스
const syncController = new SyncController();

export default syncController;
export { SyncController };