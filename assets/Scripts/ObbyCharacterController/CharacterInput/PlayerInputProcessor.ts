import { _decorator, Vec3 } from 'cc';
import { CharacterInputProcessor } from './CharacterInputProcessor';
import { EasyController, EasyControllerEvent } from 'db://assets/EasyController/kylins_easy_controller/EasyController';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
import { v3_0 } from '../../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('PlayerInputProcessor')
export class PlayerInputProcessor extends CharacterInputProcessor {
    protected onEnable(): void {
        super.onEnable();
        EasyController.on(EasyControllerEvent.MOVEMENT, this._onMoveInput, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this._onMoveInputStop, this);
        EasyController.on(EasyControllerEvent.BUTTON, this._onButton, this);
        GlobalEventBus.on(GameEvent.GAME_END, this._onGameEnd, this);
    }

    protected onDisable(): void {
        super.onDisable();
        EasyController.off(EasyControllerEvent.MOVEMENT, this._onMoveInput, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this._onMoveInputStop, this);
        EasyController.off(EasyControllerEvent.BUTTON, this._onButton, this);
        GlobalEventBus.off(GameEvent.GAME_END, this._onGameEnd, this);
        this.inputDegree = this.inputOffset = this.inputCos = this.inputSin = 0;
    }

    protected onLoad(): void {
        super.onLoad();
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
    }

    private _onGameEnd() {
        this._onMoveInputStop();
        this.enabled = false;
    }

    public lookAtDegree(degree: number): void {
        // In a 2D interface, the x-axis is 0, while in a 3D scene, the area directly in front is 0, so a -90 degree rotation is needed. (Rotate 90 degrees clockwise)
        const uiToGame = -90;
        const cameraRotationY = this.mainCamera.node.eulerAngles.y;
        v3_0.set(0, cameraRotationY + degree + uiToGame, 0);
        this.node.setRotationFromEuler(v3_0);
    }

    public playSound(clipName: string, volume: number = 1) {
        if (this.isPlayer) {
            GlobalEventBus.emit(GameEvent.PLAY_SOUND, clipName, volume);
        }
    }

    public onRespawn(): void {
        this._rb?.setLinearVelocity(Vec3.ZERO);
        this._currentState?.beforeRespawn();
        const defaultSpawn = v3_0.set(this.spawnTarget.worldPosition).add3f(0, this.spawnOffsetY, 0);
        GlobalEventBus.emit(GameEvent.REQUEST_RESPAWN, {
            node: this.node,
            defaultSpawn,
        });
    }
}
