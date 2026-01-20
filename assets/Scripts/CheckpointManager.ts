import { _decorator, Component, Node, Vec3, CharacterController } from 'cc';
const { ccclass, property } = _decorator;

/**
 * CheckpointManager
 * - Stores checkpoint positions (first checkpoint is player's start position by default)
 * - Provides API to add/set checkpoints and retrieve the current checkpoint position
 */
@ccclass('CheckpointManager')
export class CheckpointManager extends Component {
    @property({ type: Node })
    public player: Node | null = null;

    private _checkpoints: Vec3[] = [];
    private _currentIndex = 0;

    onEnable() {
        if (this.player) {
            this._checkpoints.push(this.player.worldPosition.clone());
            this._currentIndex = 0;
        }
        // Listen for respawn requests. External controllers emit 'request-respawn'
        // on this node with payload { player: Node }.
        this.node.on('request-respawn', this._onRequestRespawn, this);
    }

    onDisable() {
        this.node.off('request-respawn', this._onRequestRespawn, this);
    }

    private _onRequestRespawn(event: any) {
        const player: Node | undefined = event && event.player ? event.player : undefined;
        if (!player) return;

        const cp = this.getCurrentCheckpoint();
        if (!cp) return;

        // Try to teleport via CharacterController if present, otherwise set world position
        const cct = player.getComponent(CharacterController) as CharacterController | null;
        if (cct) {
            cct.centerWorldPosition = cp.clone();
            return;
        }

        player.setWorldPosition(cp);
    }

    public getCurrentCheckpoint(): Vec3 | null {
        if (this._checkpoints.length === 0) return null;
        return this._checkpoints[this._currentIndex].clone();
    }

    /** Replace stored checkpoints with a single checkpoint at `pos`. */
    public setSingleCheckpoint(pos: Vec3) {
        this._checkpoints = [pos.clone()];
        this._currentIndex = 0;
    }

    public addCheckpoint(pos: Vec3) {
        this._checkpoints.push(pos.clone());
    }

    public addCheckpointAtPlayer() {
        if (!this.player) return;
        this.addCheckpoint(this.player.worldPosition);
    }

    public createSecondCheckpointAbove(offsetY = 5) {
        if (this._checkpoints.length === 0) return;
        const first = this._checkpoints[0].clone();
        first.y += offsetY;
        this._checkpoints.push(first);
    }

    public setCurrentIndex(idx: number) {
        if (this._checkpoints.length === 0) return;
        this._currentIndex = Math.max(0, Math.min(idx, this._checkpoints.length - 1));
    }

    public setCheckpointAtPlayer(index: number) {
        if (!this.player) return;
        const pos = this.player.worldPosition.clone();
        if (index < 0) return;
        if (index >= this._checkpoints.length) {
            this._checkpoints[index] = pos;
        } else {
            this._checkpoints[index] = pos;
        }
    }
}
