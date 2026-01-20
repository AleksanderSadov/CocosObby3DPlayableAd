import { _decorator, Component, Vec3, CharacterController, isValid, Game } from 'cc';
import { GameEvent, GlobalEventBus } from './GlobalEventBus';
import { PlatformCheckpoint } from './PlatformCheckpoint';
const { ccclass, property } = _decorator;

@ccclass('CheckpointManager')
export class CheckpointManager extends Component {
    @property
    public spawnOffsetY: number = 5;

    @property({ readonly: true, visible: true, serializable: false})
    private _checkpoint: PlatformCheckpoint | null = null;

    onEnable() {
        GlobalEventBus.on(GameEvent.REQUEST_RESPAWN, this._onRequestRespawn, this);
        GlobalEventBus.on(GameEvent.SAVE_CHECKPOINT, this._setCheckpoint, this);
    }

    onDisable() {
        GlobalEventBus.off(GameEvent.REQUEST_RESPAWN, this._onRequestRespawn, this);
        GlobalEventBus.off(GameEvent.SAVE_CHECKPOINT, this._setCheckpoint, this);
    }

    private _onRequestRespawn(event: any) {
        const characterController: CharacterController = event.characterController;
        let respawnPosition: Vec3;
        if (isValid(this._checkpoint, true)) {
            respawnPosition = this._checkpoint.node.worldPosition.clone();
        } else {
            respawnPosition = event.defaultSpawn.clone();
        }
        respawnPosition.add(new Vec3(0, this.spawnOffsetY, 0));
        characterController.centerWorldPosition = respawnPosition;
    }

    private _setCheckpoint(checkpoint: PlatformCheckpoint) {
        // Чтобы активный чекпоинт не стрелял эвенты снова проверка в PlatformCheckpoint
        if (isValid(this._checkpoint, true)) {
            this._checkpoint.isActiveCheckpoint = false;
        }
        this._checkpoint = checkpoint;
        this._checkpoint.isActiveCheckpoint = true;
    }
}
