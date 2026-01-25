export interface IInputReceiver {
    onMoveInput(degree: number, offset: number): void;
    onMoveInputStop(): void;
    onButton(btnName: string): void;
}