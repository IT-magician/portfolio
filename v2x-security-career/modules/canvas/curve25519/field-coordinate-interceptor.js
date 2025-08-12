/**
 * Intercept field coordinates from draw-25519.js animation
 * Extract actual mathematical values, not canvas pixels
 */

import * as field from './field-25519.js';
import * as curve from './curve-25519.js';

let coordinateListeners = new Map();
let currentFieldState = {
    P: null,      // Base point P
    Q: null,      // Current nP
    moving: null, // Moving point during animation
    negR: null,   // Negated result point
    R: null       // Final result (n+1)P
};

// Store the actual drawDot function reference
let originalDrawDot = null;
let interceptActive = false;

export function registerFieldListener(id, callback) {
    coordinateListeners.set(id, callback);
}

export function removeFieldListener(id) {
    coordinateListeners.delete(id);
}

/**
 * Intercept the module scope to capture drawDot
 */
export function interceptDrawDotModule(moduleExports) {
    // Find and wrap the drawDot function if exposed
    for (let key in moduleExports) {
        if (typeof moduleExports[key] === 'function' && key.includes('draw')) {
            const original = moduleExports[key];
            moduleExports[key] = function(...args) {
                // Capture if this is drawDot-like
                if (args.length >= 4 && typeof args[1] === 'number') {
                    captureFieldCoordinate(args);
                }
                return original.apply(this, args);
            };
        }
    }
}

/**
 * Wrap the canvas context to intercept drawing operations
 */
export function wrapCanvasForFieldCapture(ctx) {
    if (ctx._fieldIntercepted) return;
    
    const originalArc = ctx.arc.bind(ctx);
    const originalFill = ctx.fill.bind(ctx);
    const originalFillText = ctx.fillText.bind(ctx);
    
    let pendingDot = null;
    let currentFillStyle = null;
    
    // Track fillStyle
    const fillStyleDesc = Object.getOwnPropertyDescriptor(ctx, 'fillStyle') ||
                          Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
    
    Object.defineProperty(ctx, 'fillStyle', {
        get() { return fillStyleDesc.get.call(this); },
        set(value) {
            currentFillStyle = value;
            fillStyleDesc.set.call(this, value);
        },
        configurable: true
    });
    
    // Intercept arc (used by drawDot)
    ctx.arc = function(x, y, radius, startAngle, endAngle) {
        if (radius < 10) { // Small radius = dot
            pendingDot = { x, y, radius, color: currentFillStyle };
        }
        return originalArc(x, y, radius, startAngle, endAngle);
    };
    
    // Intercept fill to know when dot is drawn
    ctx.fill = function() {
        if (pendingDot && (pendingDot.color === 'orange' || pendingDot.color === 'red')) {
            // Canvas coordinates captured, now reverse-engineer field coordinates
            reverseEngineerFieldCoords(ctx, pendingDot);
            
            // Track first red dot as -R (negative point)
            if (pendingDot.color === 'red' && !currentFieldState.negR) {
                // This is likely the negative point
                const coords = reverseEngineerFieldCoordsToState(ctx, pendingDot);
                currentFieldState.negR = coords;
                notifyListeners('negR-detected', coords);
            }
        }
        pendingDot = null;
        return originalFill.call(this);
    };
    
    // Intercept fillText to capture coordinate displays
    ctx.fillText = function(text, x, y) {
        if (text && text.startsWith('x=0x')) {
            // Extract hex coordinate from writeCoordinates
            const hexValue = text.substring(4);
            const value = BigInt('0x' + hexValue);
            
            // Store as Q (current nP that was just calculated)
            currentFieldState.Q = currentFieldState.Q || {};
            currentFieldState.Q.x = value;
            
            // Also update R for the result
            currentFieldState.R = currentFieldState.R || {};
            currentFieldState.R.x = value;
            
            notifyListeners('result-x', { hex: hexValue, value: value });
        } else if (text && text.startsWith('y=0x')) {
            const hexValue = text.substring(4);
            const value = BigInt('0x' + hexValue);
            
            // Store as Q (current nP that was just calculated)
            currentFieldState.Q = currentFieldState.Q || {};
            currentFieldState.Q.y = value;
            
            // Also update R for the result
            currentFieldState.R = currentFieldState.R || {};
            currentFieldState.R.y = value;
            
            notifyListeners('result-y', { hex: hexValue, value: value });
            
            // When we have both x and y, notify complete coordinate
            if (currentFieldState.Q.x && currentFieldState.Q.y) {
                // Calculate R = P + Q (next point)
                const P = getBasePoint();
                const R = curve.add(P, currentFieldState.Q);
                
                // The animation actually shows -R (not -Q)
                // -R is the intermediate point before final reflection
                currentFieldState.negR = curve.negate(R);
                currentFieldState.actualR = R;
                
                // For display purposes, use -R as -Q
                currentFieldState.negQ = currentFieldState.negR;
                
                notifyListeners('point-Q-updated', currentFieldState.Q);
                notifyListeners('negQ-calculated', currentFieldState.negQ);
            }
        } else if (text && (text === 'P' || text.match(/^\d+P$/))) {
            // Capture point labels
            notifyListeners('label', text);
        }
        return originalFillText.call(this, text, x, y);
    };
    
    ctx._fieldIntercepted = true;
}

/**
 * Reverse engineer field coordinates from canvas position
 */
function reverseEngineerFieldCoords(ctx, dot) {
    const coords = reverseEngineerFieldCoordsToState(ctx, dot);
    
    currentFieldState.moving = {
        ...coords,
        color: dot.color
    };
    
    notifyListeners('moving', currentFieldState.moving);
}

/**
 * Reverse engineer field coordinates and return them
 */
function reverseEngineerFieldCoordsToState(ctx, dot) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const marginWide = 20;
    const marginThin = 10;
    const labelSpace = 26;
    
    const fieldW = BigInt(w - marginWide - marginThin);
    const fieldH = BigInt(h - marginThin - marginWide - labelSpace);
    
    // Reverse the pointToCtx transformation
    // pointToCtx: canvasX = marginWide + (fieldW * x) / p
    // So: x = ((canvasX - marginWide) * p) / fieldW
    
    const canvasX = BigInt(Math.floor(dot.x - marginWide));
    const canvasY = BigInt(Math.floor(h - labelSpace - marginWide - dot.y));
    
    // Use BigInt for exact calculation
    const fieldX = (canvasX * field.p) / fieldW;
    const fieldY = (canvasY * field.p) / fieldH;
    
    return {
        x: fieldX,
        y: fieldY
    };
}

function notifyListeners(type, data) {
    coordinateListeners.forEach(callback => {
        callback(type, data, currentFieldState);
    });
}

/**
 * Format field coordinate for display
 */
export function formatFieldValue(value) {
    if (typeof value === 'bigint') {
        const hex = value.toString(16);
        if (hex.length > 32) {
            return '0x' + hex.substring(0, 8) + '...' + hex.substring(hex.length - 8);
        }
        return '0x' + hex;
    } else if (typeof value === 'number') {
        // For large numbers, use scientific notation
        if (value > 1e15) {
            return value.toExponential(2);
        }
        return Math.floor(value).toLocaleString();
    }
    return value?.toString() || '--';
}

/**
 * Format field coordinate as hex value
 */
export function formatFieldHex(value) {
    if (typeof value === 'bigint') {
        const hex = value.toString(16).padStart(64, '0');
        // If hex is long, show first 8 and last 8 chars
        if (hex.length > 16) {
            return '0x' + hex.substring(0, 8) + '...' + hex.substring(hex.length - 8);
        }
        return '0x' + hex;
    } else if (typeof value === 'number') {
        // Convert to hex (will lose precision for large numbers)
        const hex = Math.floor(value).toString(16);
        if (hex.length > 16) {
            return '0x' + hex.substring(0, 8) + '...' + hex.substring(hex.length - 8);
        }
        return '0x' + hex;
    }
    return value?.toString() || '--';
}

/**
 * Format field coordinate as full hex value (no truncation)
 */
export function formatFieldHexFull(value) {
    if (typeof value === 'bigint') {
        const hex = value.toString(16).padStart(64, '0');
        return '0x' + hex;
    } else if (typeof value === 'number') {
        // For Number values, show the precision limit clearly
        const hex = Math.floor(value).toString(16);
        
        // JavaScript Number can only hold ~15-17 decimal digits of precision
        // which is about 13-14 hex digits
        if (hex.length > 14) {
            // Show first 14 hex digits (accurate) and indicate precision loss
            const accurate = hex.substring(0, 14);
            const totalLength = 64;
            const remaining = totalLength - accurate.length;
            
            // Show accurate part + ... + appropriate number of ?s or 0s
            return '0x' + accurate + '...' + '?'.repeat(Math.min(8, remaining));
        }
        return '0x' + hex;
    }
    return value?.toString() || '--';
}

/**
 * Get the base point P from curve module
 */
export function getBasePoint() {
    try {
        const P = curve.P();
        currentFieldState.P = {
            x: P.x,
            y: P.y
        };
        return currentFieldState.P;
    } catch (e) {
        // Default Curve25519 base point
        return {
            x: 9n,
            y: 14781619447589544791020593568409986887264606134616475288964881837755586237401n
        };
    }
}

/**
 * Initialize field coordinate tracking
 */
export function initFieldTracking() {
    interceptActive = true;
    
    // Reset state for new animation
    currentFieldState.negR = null;
    currentFieldState.moving = null;
    
    // Get base point
    const P = getBasePoint();
    currentFieldState.P = P;
    currentFieldState.Q = P; // Start with Q = P
    
    notifyListeners('init', currentFieldState);
}

export function getFieldState() {
    return currentFieldState;
}