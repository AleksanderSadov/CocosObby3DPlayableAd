import { _decorator, ColliderComponent, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CharacterTrigger')
export class CharacterTrigger extends Component {
    private _trigger: ColliderComponent | null;

    protected onLoad(): void {
        this._trigger = this.getComponent(ColliderComponent);
    }

    protected onEnable(): void {
        this._trigger.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    protected onDisable(): void {
        this._trigger.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    onControllerTriggerEnter(event: any) {
        // Почему-то недостаточно в ноде выставить isTrigger чтобы она взаимодействовала с CharacterController, нужно еще и в ноде подписаться на события триггера
        // Поэтому пока прикрепляю этот скрипт к нужным триггер коллайдерам
    }
}


