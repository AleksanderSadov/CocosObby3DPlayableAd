import { _decorator, Component } from 'cc';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
import { ObbyCharacterController } from '../ObbyCharacterController';
const { ccclass, property } = _decorator;

@ccclass('CharacterAbstractInput')
export abstract class CharacterAbstractInput extends Component {
    protected _occt: ObbyCharacterController | null = null;

    onLoad() {
        this._occt = this.node.getComponent(ObbyCharacterController);
    }

    protected onEnable(): void {
        GlobalEventBus.on(GameEvent.GAME_END, this.onGameEnd, this);
    }

    protected onDisable(): void {
        GlobalEventBus.off(GameEvent.GAME_END, this.onGameEnd, this);
    }

    onGameEnd() {
        this._occt.control_z = 0;
        this._occt.control_x = 0;
        this.enabled = false;
    }

    registerUserActivity() {
        GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
    }
}


