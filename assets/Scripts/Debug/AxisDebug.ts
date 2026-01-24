import { _decorator, Color, Component, Vec3 } from 'cc';
import { DEBUG } from 'cc/env';
import { DebugDrawer } from './DebugDrawer';
const { ccclass, property } = _decorator;

@ccclass('AxisDebug')
export class AxisDebug extends Component {
    @property
    public showAxis = false;
    @property
    public size: number = 1;
    @property(Vec3)
    public offset: Vec3 = new Vec3();

    onLoad() {
        if (!DEBUG) {
            this.enabled = false;
            return;
        }
    }

    update() {
        if (!this.showAxis) {
            return;
        }
        this._drawForward();
        this._drawUp();
        this._drawRight();
    }

    private _drawForward() {
        this._drawAxis(this.node.forward, Color.BLUE);
    }

    private _drawUp() {
        this._drawAxis(this.node.up, Color.GREEN);
    }

    private _drawRight() {
        this._drawAxis(this.node.right, Color.RED);
    }

    private _drawAxis(direction: Vec3, color: Color) {
        DebugDrawer.drawLine(this.node.worldPosition, direction, this.size, color, this.offset);
    }
}