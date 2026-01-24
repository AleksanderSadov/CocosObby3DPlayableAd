import { _decorator, Camera, Color, Component, find, GeometryRenderer, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AxisDebug')
export class AxisDebug extends Component {
    @property
    public size: number = 1;
    @property(Vec3)
    public offset: Vec3 = new Vec3();

    private _mainCamera: Camera;
    private _gr: GeometryRenderer;

    onLoad() {
        this._mainCamera = find('Main Camera').getComponent(Camera);
        this._gr = this._mainCamera.camera.geometryRenderer;
    }

    update() {
        this._drawForward();
        this._drawUp();
        this._drawRight();
    }

    private _drawForward() {
        const start = this.node.worldPosition.clone().add(this.offset);
        const end = v3().add(this.offset);
        Vec3.scaleAndAdd(end, start, this.node.forward, this.size);
        this._gr.addLine(start, end, Color.BLUE);
    }

    private _drawUp() {
        const start = this.node.worldPosition.clone().add(this.offset);
        const end = new Vec3().add(this.offset);
        Vec3.scaleAndAdd(end, start, this.node.up, this.size);
        this._gr.addLine(start, end, Color.GREEN);
    }

    private _drawRight() {
        const start = this.node.worldPosition.clone().add(this.offset);
        const end = new Vec3().add(this.offset);
        Vec3.scaleAndAdd(end, start, this.node.right, this.size);
        this._gr.addLine(start, end, Color.RED);
    }
}