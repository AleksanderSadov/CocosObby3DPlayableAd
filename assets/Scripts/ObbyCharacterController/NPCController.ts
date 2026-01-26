import { _decorator, Color, Enum, Node, Vec3 } from 'cc';
import { AbstractController } from './AbstractController';
import { ColorChallengeType, v3_0, v3_1, v3_2 } from '../General/Constants';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
import { DEBUG } from 'cc/env';
import { DebugDrawer } from '../Debug/DebugDrawer';
import { ColorPlatform } from '../ColorChallenge/ColorPlatform';
const { ccclass, property } = _decorator;

@ccclass('NPCController')
export class NPCController extends AbstractController {
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

    @property({readonly: true, visible: true, serializable: false})
    private _round = 0;
    @property({type: Enum(ColorChallengeType),readonly: true, visible: true, serializable: false})
    private _color: ColorChallengeType;
    @property({readonly: true, visible: true, serializable: false})
    private _closestPlatform: Node | null = null;

    @property({readonly: true, visible: true, serializable: false})
    private _tryFinish = false;
    @property({readonly: true, visible: true, serializable: false})
    private _finishTargetIndex = 0;
    @property({readonly: true, visible: true, serializable: false})
    private _finished = false;

    private _delay = 1;
    
    // Для тестирования можешь цеплять камеру за NPC и смотреть его путь. Main Camera -> ThirdPersonCamera -> Target
    // Можешь перетащить в spawnTarget нужный участок пути, чтобы NPC начинал с него
    // NPC не начнут последний раунд с цветами, но можешь дропнуть себя на платформу для активации
    onLoad() {
        super.onLoad();
        const spawnTarget = this.spawnTarget;
        if (this.spawnTarget) {
            for (let index = 0; index < this.targetsRoot.children.length; index++) {
                const node = this.targetsRoot.children[index];
                if (node == spawnTarget) {
                    this.currentTarget = node;
                    this.spawnIndex = this.currentTargetIndex = index;
                    break;
                }
            }
        }
    }

    protected onEnable(): void {
        super.onEnable();
        GlobalEventBus.on(GameEvent.COLOR_ROUND_TICK, this._onRoundTick, this);
    }

    protected onDisable(): void {
        super.onDisable();
        GlobalEventBus.off(GameEvent.COLOR_ROUND_TICK, this._onRoundTick, this);
    }
    
    // Тут надо рефакторить и вынести инпуты и ИИ, убрать магические числа, но пока так
    update(dt: number) {
        super.update(dt);

        if (this._finished) {
            return;
        }

        if (this._delay > 0) {
            this._delay -= dt;
            return;
        }

        if (this.node.position.z <= -50) {
            this.currentTargetIndex = 12;
        }

        if (this._tryFinish) {
            this._updateFinishMovement(dt);
            return;
        }

        if (this._round > 0 && this.currentTargetIndex >= 11) {
            this._updateColorRound(dt);
            return;
        }

        this._updateRouteMovement(dt);
    }

    private _updateColorRound(dt: number) {
        if (!this._closestPlatform) {
            this._onMoveInputStop();
            return;
        }

        this._moveTowardsNode(this._closestPlatform, dt, {
            stopDistance: 0.3,
            onReach: () => {
                this._closestPlatform = null;
                this._onMoveInputStop();
            }
        });
    }

    private _updateRouteMovement(dt: number) {
        this.currentTarget = this.targetsRoot.children[this.currentTargetIndex];

        if (!this.currentTarget) {
            this._onMoveInputStop();
            return;
        }

        const isClimbTarget = this.currentTarget.name.includes('climb');
        const reached = this._moveTowardsNode(this.currentTarget, dt, {
            stopDistance: 0.3,
            isClimb: isClimbTarget,
            onReach: () => {
                if (this.currentTargetIndex == 7 || this.currentTargetIndex == 11) {
                    this.spawnIndex = this.currentTargetIndex;
                }
                this.currentTargetIndex++;
            }
        });
    }

    private _updateFinishMovement(dt: number) {
        this.currentTarget = this.finishLineRoot.children[this._finishTargetIndex];

        if (!this.currentTarget) {
            this._finished = true;
            this._onMoveInputStop();
            return;
        }

        this._moveTowardsNode(this.currentTarget, dt, {
            stopDistance: 0.3,
            onReach: () => this._finishTargetIndex++,
        });
    }

    private _moveTowardsNode(
        target: Node,
        dt: number,
        options: {
            stopDistance: number;
            isClimb?: boolean,
            onReach?: () => void;
        }
    ): boolean {
        const targetPos = v3_0.set(target.worldPosition);

        if (!options.isClimb) {
            targetPos.y = this.node.worldPosition.y;
        }

        const dir = v3_1.set(targetPos).subtract(this.node.worldPosition);
        const distance = dir.length();

        if (DEBUG) {
            const dirNorm = v3_2.set(dir).normalize();
            DebugDrawer.drawLine(this.node.worldPosition, dirNorm, distance, Color.RED);
        }

        if (distance < options.stopDistance) {
            options.onReach?.();
            return true;
        }

        if (!options.isClimb) {
            this.node.lookAt(targetPos);
            this._onMoveInput(0, 1);
        } else {
            this._onMoveInput(90, 1);
        }

        if (this.currentTarget?.name.includes('jump')) {
            this._currentState.onJump();
        }
        
        return false;
    }

    private _onRoundTick(payload: any) {
        if (payload.color === undefined) {
            this._onMoveInputStop();
            return;
        }

        if (payload.round === this._round) return;

        this._round = payload.round;
        this._color = payload.color;

        this._closestPlatform = this._findClosestPlatformForward(payload.platformsRoot.children, payload.color);
        if (!this._closestPlatform) {
            // впереди нет ближайших платформ, yolo к финишу
            this._tryFinish = true;
        }
    }

    private _findClosestPlatformForward(platforms: readonly Node[], color: ColorChallengeType): Node | null {
        let best: Node = null;
        let bestDistance = Number.MAX_VALUE;
        const offsetZ = 1;

        for (const platform of platforms) {
            const cp = platform.getComponent(ColorPlatform);
            if (!cp || cp.colorType !== this._color) continue;

            const dz = platform.worldPosition.z < this.node.worldPosition.z - offsetZ;
            if (!dz) continue;

            const dist = v3_0
                .set(platform.worldPosition)
                .subtract(this.node.worldPosition)
                .length();

            if (dist < bestDistance) {
                bestDistance = dist;
                best = platform;
            }
        }

        return best;
    }

    public lookAtDegree(degree: number): void {
        // NPC не подвергается повороту камеры, смотрим на цель напрямую
    }

    onRespawn() {
        this._rb?.setLinearVelocity(Vec3.ZERO);
        this._currentState?.beforeRespawn();
        this._delay = 1;
        this.currentTargetIndex = this.spawnIndex;
        this._closestPlatform = null;
        this._tryFinish = false;
    }
}
