import { _decorator, Component } from 'cc';
import { CustomNodeEvent } from './CustomNodeEvents';
const { ccclass, property } = _decorator;

// одна из возможных реализаций детекта падения - если игрок опустился ниже чекпоинта на определенный порог
// возможный аналог через триггер зоны, но через порог пока показалось более подходящим

@ccclass('ThresholdFallDetection')
export class ThresholdFallDetection extends Component {
    @property
    public fallThreshold: number = 5; // how far below checkpoint to consider it a fall

    private checkY = 0;

    update() {
        const playerY = this.node.worldPosition.y;
        if (playerY < this.checkY - this.fallThreshold) {
            this._emitFall();
        }
    }

    private _emitFall() {
        if (!this.node) return;
        this.node.emit(CustomNodeEvent.NODE_FELL);
    }
}
