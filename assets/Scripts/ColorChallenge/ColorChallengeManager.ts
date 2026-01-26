import { _decorator, Component, Node, Enum, MeshRenderer, Material } from 'cc';
import { GlobalEventBus, GameEvent } from '../Events/GlobalEventBus';
import { ColorPlatform } from './ColorPlatform';
import { ColorChallengeType } from '../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('ColorChallengeManager')
export class ColorChallengeManager extends Component {
    @property
    public roundDuration = 4;
    @property
    public waitBetweenRounds = 2;

    // Длину и ширину моста пока по простому задам статически прямо в сцене создам ноды
    // А в целом можно усложнить динамической генерацией
    @property({ type: Node })
    public platformsRoot: Node | null = null; // parent that contains color platforms

    // Пока по простому просто включу все нужные материалы по очереди
    // Если укажу их статически в редакторе то они войдут в билд и не нужно пока заморачиваться с динамической подгрузкой ресурсов
    // Из минусов редактировать список будет сложнее, но пока планирую только один раз задать список
    // Цвета нужно указать в таком порядке как в ColorChallengeType
    @property([Material])
    public materials: Material[] = [];

    @property({type: Enum(ColorChallengeType), readonly: true, visible: true, serializable: false})
    private _activeColor: ColorChallengeType;
    @property({readonly: true, visible: true, serializable: false})
    private _roundCountdown = 0;
    private _waitCountdown = 0;
    private _running = false;
    private _round = 0;

    onEnable() {
        GlobalEventBus.on(GameEvent.COLOR_GAME_START, this._startGame, this);
        GlobalEventBus.on(GameEvent.COLOR_GAME_STOP, this._stopGame, this);
        GlobalEventBus.on(GameEvent.GAME_END, this._stopGame, this);
    }

    onDisable() {
        GlobalEventBus.off(GameEvent.COLOR_GAME_START, this._startGame, this);
        GlobalEventBus.off(GameEvent.COLOR_GAME_STOP, this._stopGame, this);
        GlobalEventBus.off(GameEvent.GAME_END, this._stopGame, this);
        this._stopTimers();
    }

    private _startGame() {
        if (!this._running) {
            this._running = true;
            this._startRound();
        }
    }

    private _stopGame() {
        this._running = false;
        this._stopTimers();
    }

    private _startRound() {
        this._round += 1;
        const colors = Object.keys(ColorChallengeType);
        const randIndex = Math.floor(Math.random() * colors.length);
        this._activeColor = ColorChallengeType[colors[randIndex]];
        this._roundCountdown = this.roundDuration;
        this.activatePlatforms(colors);
        GlobalEventBus.emit(GameEvent.COLOR_ROUND_TICK, { color: this._activeColor, roundTimer: this._roundCountdown, round: this._round, platformsRoot: this.platformsRoot });
        this.schedule(this._tickRound, 1);
    }

    private _stopTimers() {
        this.unscheduleAllCallbacks();
    }

    private _tickRound() {
        this._roundCountdown -= 1;
        if (this._roundCountdown >= 0) {
            GlobalEventBus.emit(GameEvent.COLOR_ROUND_TICK, { color: this._activeColor, roundTimer: this._roundCountdown, round: this._round, platformsRoot: this.platformsRoot });
        } else {
            this.unschedule(this._tickRound);
            this.deactivatePlatforms(this._activeColor);
            this._waitCountdown = this.waitBetweenRounds;
            GlobalEventBus.emit(GameEvent.COLOR_ROUND_TICK, { waitTimer: this._waitCountdown });
            this.schedule(this._tickWait, 1);
        }
    }

    private _tickWait() {
        this._waitCountdown -= 1;
        if (this._waitCountdown > 0) {
            GlobalEventBus.emit(GameEvent.COLOR_ROUND_TICK, { waitTimer: this._waitCountdown });
        } else {
            this.unschedule(this._tickWait);
            this._startRound();
        }
    }

    private activatePlatforms(colors: string[]) {
        this.platformsRoot.children.forEach((child) => {
            const colorPlatform = child.getComponent(ColorPlatform);
            const randIndex = Math.floor(Math.random() * colors.length);
            const randomColor = ColorChallengeType[colors[randIndex]];
            colorPlatform.colorType = randomColor;
            const meshRenderer = child.getComponent(MeshRenderer)
            meshRenderer.setSharedMaterial(this.materials[randIndex], 0);
            colorPlatform.node.active = true;
        })
    }

    private deactivatePlatforms(keepColor: ColorChallengeType) {
        this.platformsRoot.children.forEach((child) => {
            const colorPlatform = child.getComponent(ColorPlatform);
            if (colorPlatform.colorType != keepColor) {
                colorPlatform.node.active = false;
            }
        })
    }
}
