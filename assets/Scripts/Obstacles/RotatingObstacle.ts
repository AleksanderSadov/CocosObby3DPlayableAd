import { _decorator, Component, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RotatingObstacle')
export class RotatingObstacle extends Component {
    @property({ tooltip: 'Скорость вращения (градусы в секунду)' })
    public minSpeed: number = 45;

    @property({ tooltip: 'Скорость вращения (градусы в секунду)' })
    public maxSpeed: number = 120;

    @property({serializable: false})
    public currentSpeed = 0;

    @property({ tooltip: 'Ось вращения'})
    public rotationAxis: Vec3 = new Vec3(0, 0, 1);

    private _rot = new Quat();

    protected onLoad(): void {
        this.currentSpeed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;
        const randomStartAngle = Math.random() * 90;
        this._setAngle(randomStartAngle);
    }

    update(deltaTime: number) {
        const angle = this.currentSpeed * deltaTime;
        this._setAngle(angle);
    }

    private _setAngle(angle: number) {
        const angleRad = angle * Math.PI / 180;
        Quat.fromAxisAngle(this._rot, this.rotationAxis, angleRad);
        this.node.rotate(this._rot);
    }
}