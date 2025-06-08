export class ThompsonSampler {
    private readonly nValues: number = 11; // possible values: 0,1,2,...,10
    private counts: number[][]; // counts for each arm and value
    private nArms: number; // number of arms/choices

    constructor(nArms: number = 2) { // update this to be number of flavors
        this.nArms = nArms;
        // Initialize with prior counts (1 for each value to start with uniform prior)
        this.counts = Array(nArms).fill(null).map(() => 
            Array(this.nValues).fill(1)
        );
    }

    /**
     * Sample from Dirichlet distribution for each arm and compute expected value
     * @returns The index of the chosen arm (0 to nArms-1)
     */
    sample(): number {
        const samples: number[] = [];
        
        for (let arm = 0; arm < this.nArms; arm++) {
            // Sample probabilities using Dirichlet distribution approximation
            const probs = this.sampleDirichlet(this.counts[arm]);
            console.log("arm: ", arm);
            console.log(probs);
            // Calculate expected value (weighted sum)
            const expectedValue = probs.reduce((sum, prob, i) => sum + i * prob, 0);
            console.log("expectedValue: ", expectedValue);
            samples.push(expectedValue);
        }

        // Return the arm with the highest sampled value
        return samples.reduce((maxArm, value, arm, arr) => 
            value > arr[maxArm] ? arm : maxArm, 0);
    }

    /**
     * Update the count for the observed reward value
     * @param chosenArm The arm that was chosen (0 to nArms-1)
     * @param reward The reward received (between 0 and 10)
     */
    update(chosenArm: number, reward: number): void {
        if (chosenArm < 0 || chosenArm >= this.nArms) {
            throw new Error(`Invalid arm index: ${chosenArm}. Must be between 0 and ${this.nArms - 1}`);
        }
        // Ensure reward is an integer in [0, 10]
        const intReward = Math.min(Math.max(Math.round(reward), 0), 10);
        this.counts[chosenArm][intReward]++;
    }

    /**
     * Get the number of arms
     * @returns The number of arms in the sampler
     */
    getNumberOfArms(): number {
        return this.nArms;
    }

    /**
     * Helper function to sample from Dirichlet distribution
     * This is an approximation using Gamma distribution
     * @param alpha concentration parameters
     * @returns sampled probabilities
     */
    private sampleDirichlet(alpha: number[]): number[] {
        // Sample from Gamma distribution for each component
        const samples = alpha.map(a => this.sampleGamma(a));
        // Normalize to get probabilities
        const sum = samples.reduce((a, b) => a + b, 0);
        return samples.map(x => x / sum);
    }

    /**
     * Helper function to sample from Gamma distribution
     * This is an approximation using the Marsaglia and Tsang method
     * @param alpha shape parameter
     * @returns sampled value
     */
    private sampleGamma(alpha: number): number {
        if (alpha < 1) {
            const u = Math.random();
            return this.sampleGamma(1 + alpha) * Math.pow(u, 1 / alpha);
        }

        const d = alpha - 1/3;
        const c = 1 / Math.sqrt(9 * d);
        
        while (true) {
            const x = this.sampleNormal();
            const v = 1 + c * x;
            if (v <= 0) continue;
            
            const v3 = v * v * v;
            const u = Math.random();
            
            if (u < 1 - 0.0331 * x * x * x * x) return d * v3;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) return d * v3;
        }
    }

    /**
     * Helper function to sample from standard normal distribution
     * Using Box-Muller transform
     * @returns sampled value
     */
    private sampleNormal(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    /**
     * The following functions are not currently used in the application:
     * 
     * - addArm(): Adds a new arm with initialized counts
     * - updateCounts(): Manually updates counts for an arm
     * - getValueDistributions(): Gets probability distributions for each arm
     * - getExpectedValues(): Calculates expected values for each arm
     * 
     * Keeping them commented for potential future use.
     */

    /**
     * Update the number of arms to have one more arm
     * To do this, add a new arm with a new set of counts (add an inner array to the counts array)
     */
    addArm(): void {
        this.nArms++;
        this.counts.push(Array(this.nValues).fill(1));
    }

    /**
     * A function to manually update the counts for an arm
     * @param arm The arm to update
     * @param value The value to update the counts for
     * @param count The count to update the counts for
     */
    updateCounts(arm: number, value: number, count: number): void {
        this.counts[arm][value] = count;
    }
    // with the two functions above, we can generate a new choice,
    // add it to the set of choices, and rate/update it.

    /**
     * Get the probability distribution over values for each arm
     * @returns Array of probability distributions for each arm
     */
    getValueDistributions(): number[][] {
        return this.counts.map(armCounts => {
            const sum = armCounts.reduce((a, b) => a + b, 0);
            return armCounts.map(count => count / sum);
        });
    }

    /**
     * Calculate the expected value for each arm
     * @returns Array of expected values for each arm
     * I don't think this is used anywhere
     */
    getExpectedValues(): number[] {
        const expectedValues: number[] = [];
        
        for (let arm = 0; arm < this.nArms; arm++) {
            // Calculate probabilities for each value
            const sum = this.counts[arm].reduce((a, b) => a + b, 0);
            const probs = this.counts[arm].map(count => count / sum);
            // Calculate expected value
            const expectedValue = probs.reduce((sum, prob, i) => sum + i * prob, 0);
            expectedValues.push(expectedValue);
        }

        return expectedValues;
    }
}