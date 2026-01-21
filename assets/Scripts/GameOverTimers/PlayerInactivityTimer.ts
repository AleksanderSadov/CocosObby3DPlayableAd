import { _decorator, Component } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('PlayerInactivityTimer')
export class PlayerInactivityTimer extends Component {
    @property
    public inactivityTime = 40;

    @property
    public timeRemaining = 0;

    protected onEnable(): void {
        this.timeRemaining = this.inactivityTime;
        this.schedule(this._tick, 1);
        GlobalEventBus.on(GameEvent.GAME_END, this._stop, this);
        GlobalEventBus.on(GameEvent.PLAYER_ACTIVITY, this._resetTimer, this);
    }

    protected onDisable(): void {
        this._stop();
    }

    private _resetTimer() {
        this.timeRemaining = this.inactivityTime;
    }

    private _tick() {
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
            this._stop();
            GlobalEventBus.emit(GameEvent.GAME_END);
        }
    }

    private _stop() {
        this.unscheduleAllCallbacks();
        GlobalEventBus.off(GameEvent.GAME_END, this._stop, this);
        GlobalEventBus.off(GameEvent.PLAYER_ACTIVITY, this._stop, this);
    }
}


