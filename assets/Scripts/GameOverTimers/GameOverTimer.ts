import { _decorator, Component, Node } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('GameOverTimer')
export class GameOverTimer extends Component {
    @property
    public gameOverTime = 180;

    @property
    public timeRemaining = 0;

    protected onEnable(): void {
        this.timeRemaining = this.gameOverTime;
        this.schedule(this._tick, 1);
        GlobalEventBus.on(GameEvent.GAME_END, this._stop, this);
    }

    protected onDisable(): void {
        this._stop();
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
    }
}


