import { _decorator, Component } from 'cc';
import { CustomNodeEvent } from '../Events/CustomNodeEvents';
const { ccclass, property } = _decorator;

// одна из возможных реализаций детекта падения - если игрок опустился ниже порога
// возможный аналоги
//  - усложнить и отслеживать относительно чекпоинта
//  - через триггер зоны

@ccclass('ThresholdFallDetection')
export class ThresholdFallDetection extends Component {
    @property
    public fallThreshold: number = -10; // how far below world origin to consider it a fall

    update() {
        const playerY = this.node.worldPosition.y;
        if (playerY < this.fallThreshold) {
            this._emitFall();
        }
    }

    private _emitFall() {
        if (!this.node) return;
        this.node.emit(CustomNodeEvent.NODE_FELL);
    }
}
