export enum BossPhase {
    Phase1 = 1,
    Phase2 = 2,
    Phase3 = 3,
}

export function getPhaseFromHpRatio(ratio: number): BossPhase {
    if (ratio > 0.7) return BossPhase.Phase1;
    if (ratio > 0.4) return BossPhase.Phase2;
    return BossPhase.Phase3;
}

export class BossPhaseTracker {
    private _phase = BossPhase.Phase1;
    private _callbacks: ((phase: BossPhase) => void)[] = [];

    get phase(): BossPhase {
        return this._phase;
    }

    onChange(cb: (phase: BossPhase) => void) {
        this._callbacks.push(cb);
    }

    update(hpRatio: number) {
        const newPhase = getPhaseFromHpRatio(hpRatio);
        if (newPhase !== this._phase) {
            this._phase = newPhase;
            for (const cb of this._callbacks) {
                cb(newPhase);
            }
        }
    }
}
