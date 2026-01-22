import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property(AudioSource)
    musicAudioSource: AudioSource;

    @property(AudioSource)
    oneShotAudioSource: AudioSource;

    private _toggle = true;

    @property(AudioClip)
    public jumpClip: AudioClip;

    protected onEnable(): void {
        GlobalEventBus.on(GameEvent.TOGGLE_SOUNDS, this._toggleSounds, this);
        GlobalEventBus.on(GameEvent.PLAY_SOUND, this._playOneShot, this);
    }

    protected onDisable(): void {
        GlobalEventBus.off(GameEvent.TOGGLE_SOUNDS, this._toggleSounds, this);
        GlobalEventBus.off(GameEvent.PLAY_SOUND, this._playOneShot, this);
    }

    private _playOneShot(name: string, volume: number) {
        volume ??= 1;
        // пока статически пара звуков и не заморачиваемся с динамической подгрузкой
        if (name == 'jump' && this.jumpClip && this._toggle) {
            this.oneShotAudioSource?.playOneShot(this.jumpClip, volume);
        }
    }

    private _toggleSounds() {
        if (this._toggle) {
            this._toggle = false;
            this.musicAudioSource?.stop();
            this.oneShotAudioSource?.stop();
        } else {
            this._toggle = true;
            this.musicAudioSource?.play();
        }
    }
}


