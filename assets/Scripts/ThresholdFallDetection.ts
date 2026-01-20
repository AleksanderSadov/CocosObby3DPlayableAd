import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ThresholdFallDetection')
export class ThresholdFallDetection extends Component {
    @property
    public fallThreshold: number = 5; // how far below checkpoint to consider it a fall

    private checkY = 0;

    onLoad() {
        if (!this.node) {
            console.warn('ThresholdFallDetection: `node` is not assigned');
            return;
        }

        // Initialize first checkpoint from node start world position
        const start = this.node.worldPosition.clone();
        this.checkY = start.y;
    }

    update() {
        if (!this.node) return;
        const playerY = this.node.worldPosition.y;
        if (playerY < this.checkY - this.fallThreshold) {
            this._emitFall();
        }
    }

    private _emitFall() {
        if (!this.node) return;
        this.node.emit('node-fell');
    }
}
