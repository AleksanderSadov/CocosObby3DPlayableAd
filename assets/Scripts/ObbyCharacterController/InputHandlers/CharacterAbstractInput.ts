import { _decorator, Component, Node } from 'cc';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('CharacterAbstractInput')
export abstract class CharacterAbstractInput extends Component {
    protected onEnable(): void {
        GlobalEventBus.on(GameEvent.GAME_END, this.onGameEnd, this);
    }

    protected onDisable(): void {
        GlobalEventBus.off(GameEvent.GAME_END, this.onGameEnd, this);
    }

    onGameEnd() {
        this.enabled = false;
    }

    registerUserActivity() {
        GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
    }
}


