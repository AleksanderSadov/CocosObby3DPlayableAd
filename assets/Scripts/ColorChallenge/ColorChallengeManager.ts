import { _decorator, Component, Node, Label, CharacterController } from 'cc';
import { GlobalEventBus, GameEvent } from '../Events/GlobalEventBus';
import { ColorPlatform } from './ColorPlatform';
const { ccclass, property } = _decorator;

@ccclass('ColorChallengeManager')
export class ColorChallengeManager extends Component {
    @property({ type: Node })
    public platformsRoot: Node | null = null; // parent that contains color platforms

    @property({ type: Node })
    public playerNode: Node | null = null;

    @property
    public roundDuration = 8; // seconds

    private _platforms: ColorPlatform[] = [];
    private _activeColor: string | null = null;
    private _remaining = 0;
    private _running = false;

    onLoad() {
        if (this.platformsRoot) {
            const comps = this.platformsRoot.getComponentsInChildren(ColorPlatform);
            this._platforms = comps;
        }
    }

    onEnable() {
        GlobalEventBus.on(GameEvent.SAVE_CHECKPOINT, this._onSaveCheckpoint, this);
    }

    onDisable() {
        GlobalEventBus.off(GameEvent.SAVE_CHECKPOINT, this._onSaveCheckpoint, this);
        this._stopTimer();
    }

    private _onSaveCheckpoint(checkpoint: any) {
        // If the saved checkpoint node equals the platformsRoot parent (configurable), start the challenge.
        // To start the challenge from a specific checkpoint, set the platformsRoot to be the area and
        // place this manager in scene and it will start once SAVE_CHECKPOINT occurs for that checkpoint node.
        // For simplicity, start when any SAVE_CHECKPOINT happens and platformsRoot is set.
        if (!this.platformsRoot) return;
        if (!this._running) {
            this.startRound();
        }
    }

    public startRound() {
        if (this._platforms.length === 0) return;
        this._running = true;
        // pick random color among available platforms
        const colors = Array.from(new Set(this._platforms.map(p => p.colorName)));
        this._activeColor = colors[Math.floor(Math.random() * colors.length)];
        this._remaining = this.roundDuration;
        GlobalEventBus.emit(GameEvent.COLOR_ROUND_START, { color: this._activeColor, duration: this._remaining });
        this._startTimer();
    }

    private _startTimer() {
        this.unscheduleAllCallbacks();
        this.schedule(this._tick, 1);
    }

    private _stopTimer() {
        this.unscheduleAllCallbacks();
    }

    private _tick() {
        this._remaining -= 1;
        GlobalEventBus.emit(GameEvent.COLOR_ROUND_START, { color: this._activeColor, duration: this._remaining });
        // immediate success if player already on correct color
        if (this._checkPlayerOnActive()) {
            this._onSuccess();
            return;
        }
        if (this._remaining <= 0) {
            // time up
            if (this._checkPlayerOnActive()) {
                this._onSuccess();
            } else {
                this._onFail();
            }
        }
    }

    private _checkPlayerOnActive(): boolean {
        if (!this._activeColor) return false;
        for (const p of this._platforms) {
            if (p.colorName === this._activeColor && p.isPlayerOn) return true;
        }
        return false;
    }

    private _onSuccess() {
        GlobalEventBus.emit(GameEvent.COLOR_ROUND_SUCCESS, { color: this._activeColor });
        // continue with next round
        this._stopTimer();
        this.startRound();
    }

    private _onFail() {
        GlobalEventBus.emit(GameEvent.COLOR_ROUND_FAIL, { color: this._activeColor });
        this._stopTimer();
        // disable platform under player (if any) then request respawn
        const playerPlatform = this._platforms.find(p => p.isPlayerOn);
        if (playerPlatform) {
            playerPlatform.hidePlatform();
        }
        // request respawn for player
        if (this.playerNode) {
            const cct = this.playerNode.getComponent(CharacterController);
            if (cct) {
                GlobalEventBus.emit(GameEvent.REQUEST_RESPAWN, { characterController: cct, defaultSpawn: this.playerNode.worldPosition.clone() });
            }
        }
        this._running = false;
    }
}
