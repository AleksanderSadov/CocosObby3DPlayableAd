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
    // Ноды визуальные у путей можно просто выключить после тестирования
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
    @property({readonly: true, visible: true, serializable: false})
    private _delay = 2;
    
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
    
    // Тут надо рефакторить, но пока так
    update(dt: number) {
        super.update(dt);

        if (this._finished) {
            return;
        }

        if (this._delay > 0) {
            this._delay -= dt;
            return;
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
            onReach: () => this._finishTargetIndex++,
        });
    }

    private _moveTowardsNode(
        target: Node,
        dt: number,
        options: {
            isClimb?: boolean,
            onReach?: () => void;
        }
    ): boolean {
        const stopDistance = 0.5;
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

        if (distance < stopDistance) {
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

        if (this._round === payload.round) {
            return;
        }

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
        const randomSkip = Math.floor(Math.random() * 2); // немного рандома в выбор платформы, чтобы не выбирали одинаковые
        let skipCount = 0;

        for (const platform of platforms) {
            const cp = platform.getComponent(ColorPlatform);
            if (cp.colorType !== this._color) {
                continue;
            }

            const isPlatformAhead = platform.worldPosition.z < this.node.worldPosition.z - offsetZ;
            if (!isPlatformAhead) {
                continue;
            }

            const dist = v3_0
                .set(platform.worldPosition)
                .subtract(this.node.worldPosition)
                .length();

            if (dist < bestDistance) {
                if (randomSkip > skipCount) {
                    skipCount++;
                    continue;
                }
                bestDistance = dist;
                best = platform;
            }
        }

        return best;
    }

    public lookAtDegree(degree: number): void {
        // NPC не подвергается повороту камеры, смотрим на цель напрямую
    }

    protected _onRespawn() {
        this.inputDegree = this.inputOffset = 0;
        this.inputCos = this.inputSin = 0;
        this._rb?.setLinearVelocity(Vec3.ZERO);
        this._currentState?.beforeRespawn();
        this._delay = Math.random() * 1 + 1;
        this.currentTargetIndex = this.spawnIndex;
        this._round = 0;
        this._color = null;
        this._closestPlatform = null;
        this._tryFinish = false;
        const spawnNode = this.targetsRoot.children[this.spawnIndex];
        this.node.setWorldPosition(spawnNode.worldPosition);
    }
}
