import { _decorator, Animation, Component, EventMouse, Input, input, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CocosExamplePlayerController')
export class CocosExamplePlayerController extends Component {
    @property({type: Animation})
    public BodyAnim: Animation | null = null;

    private _startJump: boolean = false;
    private _jumpStep: number = 0.0;
    private _curPos: Vec3 = new Vec3();
    private _targetPos: Vec3 = new Vec3();
    private _curJumpTime: number = 0.0;
    private _jumpTime: number = 0.1;
    private _curJumpSpeed: number = 0.0;
    private _deltaPos: Vec3 = new Vec3();
    private _curMoveIndex = 0;

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));
        if (step === 1) {
            this.BodyAnim.play('CocosExampleOneStep');
        } else if (step === 2) {
            this.BodyAnim.play('CocosExampleTwoStep');
        }
        this._curMoveIndex += step;
    }

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    reset() {
        this._curMoveIndex = 0;
    }
}


