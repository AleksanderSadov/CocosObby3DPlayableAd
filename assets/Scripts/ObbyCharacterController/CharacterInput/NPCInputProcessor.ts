import { _decorator, Color, Node, Vec3 } from 'cc';
import { ray, v3_0, v3_1, v3_2 } from '../../General/Constants';
import { CharacterInputProcessor } from './CharacterInputProcessor';
import { DEBUG } from 'cc/env';
import { DebugDrawer } from '../../Debug/DebugDrawer';
import { CustomNodeEvent } from '../../Events/CustomNodeEvents';
import { CharacterMovement } from 'db://assets/EasyController/kylins_easy_controller/CharacterMovement';
const { ccclass, property } = _decorator;

@ccclass('NPCInputProcessor')
export class NPCInputProcessor extends CharacterInputProcessor {
    @property(Node)
    public targetsRoot: Node | null = null;

    @property({type: Node, readonly: true, visible: true, serializable: false})
    public currentTarget: Node | null = null;
    @property({readonly: true, visible: true, serializable: false})
    public currentTargetIndex = 0;
    @property({readonly: true, visible: true, serializable: false})
    public spawnIndex = 0;

    // @property({readonly: true, visible: true, serializable: false})
    // public degree: number = 0;

    // @property({readonly: true, visible: true, serializable: false})
    // public targetVector: Vec3 = new Vec3();
    // @property({readonly: true, visible: true, serializable: false})
    // public targetVectorNormalized: Vec3 = new Vec3();
    // @property
    // public deg = 0;

    private _cm: CharacterMovement;

    private _delay = 1;

    onLoad() {
        this._cm = this.getComponent(CharacterMovement);
        const spawnTarget = this._cm.spawnTarget;
        if (this._cm.spawnTarget) {
            this.targetsRoot.children.forEach((node, index) => {
                if (node == spawnTarget) {
                    this.currentTarget = node;
                    this.spawnIndex = this.currentTargetIndex = index;
                }
            })
        }
    }

    protected onEnable(): void {
        this.node.on(CustomNodeEvent.BEFORE_RESPAWN, this._beforeRespawn, this);
    }

    protected onDisable(): void {
        this.node.off(CustomNodeEvent.BEFORE_RESPAWN, this._beforeRespawn, this);
    }

    // Для тестирования также можешь цеплять камеру за NPC и смотреть его путь. Main Camera -> ThirdPersonCamera -> Target
    update(dt: number) {
        this.currentTarget = this.targetsRoot.children[this.currentTargetIndex];

        const isClimbing = this._cm.currentStateName == 'CharacterClingState';
        // console.log("isClimbing", isClimbing);
        

        if (!this.currentTarget) {
            this._onMoveInputStop();
            return;
        }

        const isClimbTarget = this.currentTarget.name.includes("climb");

        
        const targetPos = v3_0.set(this.currentTarget.worldPosition);
        if (!isClimbTarget) {
            targetPos.y = this.node.worldPosition.y;
        }

        const dir = v3_1.set(targetPos).subtract(this.node.worldPosition);
        const distance = dir.length();
        const dirNorm = v3_2.set(dir).normalize();

        if (DEBUG) {
            DebugDrawer.drawLine(this.node.worldPosition, dirNorm, distance, Color.RED);
        }

        if (this._delay > 0) {
            this._delay -= dt;
            return;
        }

        const stopDistance = 0.3;
        if (distance < stopDistance) {
            this._onMoveInputStop();
            this.currentTargetIndex++;
            return;
        }

        if (isClimbTarget) {
            this._onMoveInput(90, 1);
            return;
        }

        this.node.lookAt(targetPos);
        this._onMoveInput(0, 1);

        if (this.currentTarget.name.includes("jump")) {
            this._onButton('btn_slot_0');
        }
    }

    private _beforeRespawn() {
        this._delay = 1;
        this.currentTargetIndex = this.spawnIndex;
    }
}


