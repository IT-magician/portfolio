/**
 * Math library over the field Fp - ISOLATED VERSION
 * Factory pattern for creating independent field instances
 */

/**
 * Create an isolated field instance with its own prime
 * @param {Number} initialP - The prime for this field (default: 61)
 * @returns {Object} Field operations object with isolated state
 */
export function createFieldInstance(initialP = 61) {
    // Private state for this instance
    let p = initialP;
    let pHalf = Math.floor((p - 1) / 2);
    
    /**
     * Returns a three-tuple (gcd, x, y) such that
     * a * x + b * y == gcd, where gcd is the greatest
     * common divisor of a and b.
     *
     * This function implements the extended Euclidean
     * algorithm and runs in O(log b) in the worst case.
     */
    function extended_euclidean_algorithm(a, b) {
        let s = 0, old_s = 1;
        let t = 1, old_t = 0;
        let r = b, old_r = a;
        let tmp = undefined;

        while (r !== 0) {
            if (Number.isNaN(r)) {
                throw Error('Euclid found a NaN');
            }

            let quotient = Math.floor(old_r / r);

            tmp = old_r - (quotient * r);
            old_r = r;
            r = tmp;
            tmp = old_s - (quotient * s);
            old_s = s;
            s = tmp;
            tmp = old_t - (quotient * t);
            old_t = t;
            t = tmp;
        }
        return {
            gcd: old_r,
            x: old_s,
            y: old_t
        };
    }

    /**
     * Reduce a number to modulo p (into the positive range of this field).
     */
    function reduce(n) {
        n %= p;
        if (n < 0) {
            n += p;
        }
        return n;
    }

    /**
     * Returns the multiplicative inverse of n modulo p.
     */
    function inverseOf(n) {
        if (n === 0) {
            throw Error('Illegal argument zero');
        }
        let { _gcd, x, _y } = extended_euclidean_algorithm(n, p);
        return reduce(x);
    }

    /**
     * Negate the number such that n + -n = 0
     */
    function negate(n) {
        return reduce(p - n);
    }

    /**
     * "By factoring out powers of 2, find Q and S such that p−1 = Q*2^S with Q odd"
     */
    let shanksPartitions = (prime) => {
        let Q = prime - 1;
        let S = 0;

        while (Q !== 0 && Q % 2 === 0) {
            Q >>= 1;
            S += 1;
        }
        if (!Q) {
            throw Error('Unexpected failure to factor out Shanks partitions');
        }
        return [Q, S];
    };

    /**
     * Modular exponentiation - find n^e mod p efficiently.
     */
    function pow(n, e) {
        if (e === 0) {
            return 1;
        }
        // result = x * y**e, keep this true while reducing y and e
        let x = 1;
        let y = n;
        for (;;) {
            if (e === 1) {
                return x * y % p;
            } else if (e % 2 === 1) {
                e -= 1;
                x = x * y % p;
            } else {
                e >>= 1;
                y = y**2 % p;
            }
        }
    }

    /**
     * Use Euler's Criterion to test whether n has valid roots in Fp.
     */
    let eulersCriterion = (n) => {
        return pow(n, pHalf) === 1;
    };

    /**
     * Given one root in Fp, derive and return the pair.
     */
    let rootsFor = (r) => {
        let rt = [r, p-r];
        return rt.sort((a, b) => { return a - b });
    };

    /**
     * Find the square roots of n in Fp, if any.
     */
    function sqrt(n) {
        if (n === 0) {
            return [0, 0];
        }
        if (!eulersCriterion(n)) {
            return undefined;
        }

        // Tonelli–Shanks algorithm
        let [Q, S] = shanksPartitions(p);

        // find a z which is not a square
        let z;
        for (z = 2; z < p; z++) {
            if (!eulersCriterion(z)) {
                break;
            }
        }

        let M = S;
        let c = pow(z, Q);
        let t = pow(n, Q);
        let R = pow(n, Math.floor((Q+1)/2));
        for (;;) {
            if (t === 0) {
                return rootsFor(0);
            }
            if (t === 1) {
                return rootsFor(R);
            }
            // use repeated squaring to find the least i, 0 < i < M, such that t^{2^i} = 1 mod p
            let i = 1;
            for (; i < M; i++) {
                let chk = pow(t, (2**i));
                if (chk === 1) {
                    break;
                }
            }
            let b = pow(c, pow(2, M-i-1));
            M = i;
            let bb = b * b;
            c = bb % p;
            t = t * bb % p;
            R = R * b % p;
        }
    }

    /**
     * Return the bignum as a hex string, padded with zeros.
     */
    function toHex(a, bits) {
        bits = Number(bits || 0);
        let nibbles = 2 * Math.floor((bits+7)/8);
        let result = a.toString(16);
        if (result.length < nibbles) {
            result = '0'.repeat(nibbles-result.length) + result;
        }
        return result;
    }

    /**
     * Set a new prime for this field instance
     * Updates pHalf automatically
     */
    function setP(p_) {
        if (typeof p_ !== 'number' || p_ < 2) {
            throw new Error(`Invalid field size: ${p_}`);
        }
        p = p_;
        pHalf = Math.floor((p - 1) / 2);
    }

    // Return the public API for this field instance
    return {
        // Expose p as a getter to prevent direct modification
        get p() { return p; },
        
        // Functions
        setP,
        reduce,
        inverseOf,
        negate,
        pow,
        sqrt,
        toHex,
        
        // For debugging/testing
        _getState() {
            return { p, pHalf };
        }
    };
}

/**
 * Create a default instance for backward compatibility
 * This will be used by modules that don't create their own instance
 */
const defaultInstance = createFieldInstance(61);

// Export both the factory and default instance exports for compatibility
export const setP = defaultInstance.setP;
export const reduce = defaultInstance.reduce;
export const inverseOf = defaultInstance.inverseOf;
export const negate = defaultInstance.negate;
export const pow = defaultInstance.pow;
export const sqrt = defaultInstance.sqrt;
export const toHex = defaultInstance.toHex;
export const p = defaultInstance.p;

// Also export the default instance itself
export default defaultInstance;