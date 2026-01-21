import { _decorator, EventTarget } from 'cc';
// По документации: https://docs.cocos.com/creator/3.8/manual/en/engine/event/event-emit.html
// Кстати, документация не рекомендует использовать Node для кастомных событий, а оставить там только родные эвенты ноды (тачи и тд). С другой стороны это удобно для коммуникации компонентов в пределах одной ноды.
// Пока по простому и не усложнял оберткой с типизацией аргументов событий
export const GlobalEventBus = new EventTarget();

export enum GameEvent {
    SAVE_CHECKPOINT = 'SAVE_CHECKPOINT',
    REQUEST_RESPAWN = 'REQUEST_RESPAWN',
    COLOR_ROUND_START = 'COLOR_ROUND_START',
    COLOR_ROUND_END = 'COLOR_ROUND_END',
    COLOR_ROUND_SUCCESS = 'COLOR_ROUND_SUCCESS',
    COLOR_ROUND_FAIL = 'COLOR_ROUND_FAIL',
}