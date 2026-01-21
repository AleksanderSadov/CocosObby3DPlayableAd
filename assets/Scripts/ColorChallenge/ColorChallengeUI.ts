import { _decorator, Component, Label, Node } from 'cc';
import { GlobalEventBus, GameEvent } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('ColorChallengeUI')
export class ColorChallengeUI extends Component {
    @property({ type: Label })
    public iconLabel: Label | null = null;

    @property({ type: Label })
    public timerLabel: Label | null = null;

    onEnable() {
        GlobalEventBus.on(GameEvent.COLOR_ROUND_START, this.onRoundStart, this);
        GlobalEventBus.on(GameEvent.COLOR_ROUND_SUCCESS, this.onRoundSuccess, this);
        GlobalEventBus.on(GameEvent.COLOR_ROUND_FAIL, this.onRoundFail, this);
    }

    onDisable() {
        GlobalEventBus.off(GameEvent.COLOR_ROUND_START, this.onRoundStart, this);
        GlobalEventBus.off(GameEvent.COLOR_ROUND_SUCCESS, this.onRoundSuccess, this);
        GlobalEventBus.off(GameEvent.COLOR_ROUND_FAIL, this.onRoundFail, this);
    }

    onRoundStart(payload: any) {
        const color = payload.color ?? 'none';
        const duration = payload.duration ?? 0;
        if (this.iconLabel) this.iconLabel.string = color.toUpperCase();
        if (this.timerLabel) this.timerLabel.string = `${Math.max(0, Math.round(duration))}`;
    }

    onRoundSuccess(payload: any) {
        // brief flash or update
    }

    onRoundFail(payload: any) {
        // clear UI
        if (this.iconLabel) this.iconLabel.string = '';
        if (this.timerLabel) this.timerLabel.string = '';
    }
}
