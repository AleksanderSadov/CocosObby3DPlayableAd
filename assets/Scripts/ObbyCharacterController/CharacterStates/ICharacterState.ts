export interface ICharacterState {
    onEnter(prevState?: any, payload?: any): void;
    onExit(nextState?: any): void;
    updateState(deltaTime: number): void;
    onMoveInput(degree: number, offset: number): void;
    onMoveInputStop(): void;
    onJump(): void;
    beforeRespawn(): void;
}
