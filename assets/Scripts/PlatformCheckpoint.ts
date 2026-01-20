import { _decorator, ColliderComponent, Component, log, Node } from 'cc';
import { CheckpointManager } from './CheckpointManager';
const { ccclass, property } = _decorator;

@ccclass('PlatformCheckpoint')
export class PlatformCheckpoint extends Component {
    @property
    public spawnOffsetY: number = 1.5;

    @property({ type: Node })
    public checkpointManagerNode: Node | null = null;

    @property
    public isActiveCheckpoint: boolean = false;

    private _triggerCollider: ColliderComponent | null = null;

    onLoad() {
        const colliders = this.getComponents(ColliderComponent);
        colliders.forEach((collider) => {
            if (collider.isTrigger) {
                this._triggerCollider = collider;
            }
        });
    }
    
    protected onEnable(): void {
        // onControllerColliderHit триггерится постоянно когда игрок стоит на платформе, нужно иметь это ввиду
        // поэтому детект сохранения сделал через отдельный триггер коллайдер
        this._triggerCollider.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    protected onDisable(): void {
        this._triggerCollider.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    onControllerTriggerEnter(event: any) {
        if (this.isActiveCheckpoint) {
            return;
        }
        this._onSaveCheckpointRequest();
    }

    private _onSaveCheckpointRequest() {
        const spawnPos = this.node.worldPosition.clone();
        spawnPos.y += this.spawnOffsetY;

        // Find checkpoint manager and set single checkpoint
        let cm: CheckpointManager | null = null;
        if (this.checkpointManagerNode) cm = this.checkpointManagerNode.getComponent(CheckpointManager) as CheckpointManager | null;
        if (!cm && this.node.scene) {
            const roots = this.node.scene.children;
            for (let i = 0; i < roots.length && !cm; i++) {
                cm = roots[i].getComponentInChildren ? roots[i].getComponentInChildren(CheckpointManager) : null;
            }
        }

        if (cm) {
            cm.setSingleCheckpoint(spawnPos);
        }
    }
}
