import { _decorator, Color, Enum, Node } from 'cc';
import { ColorChallengeType, v3_0, v3_1, v3_2 } from '../../General/Constants';
import { CharacterInputProcessor } from './CharacterInputProcessor';
import { DEBUG } from 'cc/env';
import { DebugDrawer } from '../../Debug/DebugDrawer';
import { CustomNodeEvent } from '../../Events/CustomNodeEvents';
import { CharacterMovement } from 'db://assets/EasyController/kylins_easy_controller/CharacterMovement';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
import { ColorPlatform } from '../../ColorChallenge/ColorPlatform';
const { ccclass, property } = _decorator;

@ccclass('NPCInputProcessor')
export class NPCInputProcessor extends CharacterInputProcessor {
    @property(Node)
    public targetsRoot: Node | null = null;

    @property(Node)
    public finishLineRoot: Node | null = null;

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
        // GlobalEventBus.on(GameEvent.COLOR_GAME_START, this._startGame, this);
        // GlobalEventBus.on(GameEvent.COLOR_GAME_STOP, this._stopGame, this);
        GlobalEventBus.on(GameEvent.COLOR_ROUND_TICK, this._onRoundTick, this);
    }

    protected onDisable(): void {
        this.node.off(CustomNodeEvent.BEFORE_RESPAWN, this._beforeRespawn, this);
        GlobalEventBus.off(GameEvent.COLOR_ROUND_TICK, this._onRoundTick, this);
    }

    // Для тестирования также можешь цеплять камеру за NPC и смотреть его путь. Main Camera -> ThirdPersonCamera -> Target
    update(dt: number) {
        if (this._round > 0) {
            if (this._closestPlatform) {
                this._goToTarget(this._closestPlatform, dt);
            } else {
                // this.targetsRoot = this.finishLineRoot;
            }
            return;
        }


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

    @property({readonly: true, visible: true, serializable: false})
    private _round = 0;
    @property({type: Enum(ColorChallengeType),readonly: true, visible: true, serializable: false})
    private _color: ColorChallengeType;
    @property({readonly: true, visible: true, serializable: false})
    private _closestPlatform: Node | null = null;
    private _onRoundTick(payload: any) {
        // console.log("NPCInputProcessor _onRoundTick", payload);
        if (payload.color == undefined) {
            // this._color = undefined;
            // this._closestPlatform = null;
            this._onMoveInputStop();
            return;
        }

        if (payload.round != this._round) {
            this._round = payload.round;
            this._color = payload.color;
            let closestPlatform = null;
            let closestDistance = Number.MAX_VALUE;
            payload.platformsRoot.children.forEach((platformNode: Node) => {
                const colorPlatform = platformNode.getComponent(ColorPlatform);
                if (colorPlatform.colorType == this._color) {
                    const distance = v3_0.set(platformNode.worldPosition).subtract(this.node.worldPosition).length();
                    const offset = 1; // чтобы не засчитал на которой уже стоим
                    const towardsFinish = platformNode.worldPosition.z < this.node.worldPosition.z - offset;
                    if (towardsFinish && distance < closestDistance) {
                        closestDistance = distance;
                        closestPlatform = platformNode;
                    }
                }
            });
            this._closestPlatform = closestPlatform;
        }
    }

    _goToTarget(target: Node, dt: number) {
        const targetPos = v3_0.set(target.worldPosition);
        targetPos.y = this.node.worldPosition.y;

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

        this.node.lookAt(targetPos);
        this._onMoveInput(0, 1);
    }

    private _beforeRespawn() {
        this._delay = 1;
        this.currentTargetIndex = this.spawnIndex;
        // this._color = undefined;
        // this._closestPlatform = null;
    }
}


