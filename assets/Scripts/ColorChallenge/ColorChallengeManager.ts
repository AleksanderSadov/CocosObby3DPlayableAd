import { _decorator, Component, Node, Enum, MeshRenderer, Material } from 'cc';
import { GlobalEventBus, GameEvent } from '../Events/GlobalEventBus';
import { ColorPlatform } from './ColorPlatform';
import { ColorChallengeType } from '../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('ColorChallengeManager')
export class ColorChallengeManager extends Component {
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

    @property({ type: Node })
    public playerNode: Node | null = null;

    @property
    public roundDuration = 4; // seconds

    private _platforms: ColorPlatform[] = [];
    @property({type: Enum(ColorChallengeType), readonly: true, visible: true, serializable: false})
    private _activeColor: ColorChallengeType;
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
        const colors = Object.keys(ColorChallengeType);
        const randIndex = Math.floor(Math.random() * colors.length);
        this._activeColor = ColorChallengeType[colors[randIndex]];
        this._remaining = this.roundDuration;
        GlobalEventBus.emit(GameEvent.COLOR_ROUND_START, { color: this._activeColor, duration: this._remaining });
        this._startTimer();

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
        if (this._remaining <= 0) {
            this._stopTimer();
            this.platformsRoot.children.forEach((child) => {
                const colorPlatform = child.getComponent(ColorPlatform);
                if (colorPlatform.colorType != this._activeColor) {
                    colorPlatform.node.active = false;
                }
            })
            this.schedule(this.startRound, 2);
        }
    }
}
