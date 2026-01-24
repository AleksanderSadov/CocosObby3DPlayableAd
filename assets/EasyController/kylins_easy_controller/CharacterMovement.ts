import { _decorator, Component, v3, RigidBody, Vec3, find, Camera, SkeletalAnimation, AnimationClip, Collider, ICollisionEvent, PhysicsSystem, geometry, PhysicsRayResult, CapsuleCollider, Quat } from 'cc';
import { EasyController, EasyControllerEvent } from './EasyController';
import { ClimbableWall } from '../../Scripts/Obstacles/ClimbableWall';
const { ccclass, property } = _decorator;

const v3_1 = v3();

@ccclass('CharacterMovement')
export class CharacterMovement extends Component {

    @property(Camera)
    mainCamera: Camera;

    @property
    velocity = 1.0;

    @property
    jumpVelocity = 1.0;

    @property
    maxJumpTimes: number = 0;
    private _curJumpTimes: number = 0;

    @property(AnimationClip)
    idleAnimClip: AnimationClip;

    @property(AnimationClip)
    moveAnimClip: AnimationClip;

    @property(AnimationClip)
    jumpBeginAnimClip: AnimationClip;

    @property(AnimationClip)
    jumpLoopAnimClip: AnimationClip;

    @property(AnimationClip)
    jumpLandAnimClip: AnimationClip;

    _rigidBody: RigidBody;
    _isMoving: boolean = false;
    _velocityScale: number = 1.0;

    _isInTheAir: boolean = false;
    _currentVerticalVelocity: number = 0.0;
    
    private _capsuleCollider: CapsuleCollider;

    @property({type: SkeletalAnimation, visible: true})
    private _anim: SkeletalAnimation;

    protected onLoad(): void {
        this._capsuleCollider = this.getComponent(CapsuleCollider);
    }

    start() {
        if (!this.mainCamera) {
            this.mainCamera = find('Main Camera')?.getComponent(Camera);
        }
        this._rigidBody = this.node.getComponent(RigidBody);
        if (this._anim) {
            let clipArr = [
                this.idleAnimClip,
                this.moveAnimClip,
                this.jumpBeginAnimClip,
                this.jumpLoopAnimClip,
                this.jumpLandAnimClip
            ];
            for (let i = 0; i < clipArr.length; ++i) {
                let clip = clipArr[i];
                if (clip) {
                    if (!this._anim.getState(clip.name)) {
                        this._anim.addClip(clip);
                    }
                }
            }
            if (this.idleAnimClip) {
                this._anim.play(this.idleAnimClip.name);
            }
        }

        EasyController.on(EasyControllerEvent.MOVEMENT, this.onMovement, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMovementRelease, this);
        EasyController.on(EasyControllerEvent.BUTTON, this.onJump, this);

        let myCollider = this.getComponent(Collider);
        myCollider?.on('onCollisionEnter',(target:ICollisionEvent)=>{
            if(target.otherCollider != target.selfCollider){
                this.onLand();
            }
        });
    }

    _checkStartClimb() {
        const position = this.node.worldPosition;
        const dir = this.node.forward;
        const offset = this._isClinging ? -0.25 : 0.25;
        let outRay = new geometry.Ray(position.x, position.y + offset, position.z, dir.x, dir.y, dir.z);
        if (PhysicsSystem.instance.raycastClosest(outRay, 0xffffffff, this._capsuleCollider.radius + 0.1)) {
            const hit: PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
            const climbableWall = hit.collider.getComponent(ClimbableWall);
            if (climbableWall) {
                const check = 0.2; // почти вертикальная поверхность
                const dot = Vec3.dot(hit.hitNormal, this.node.up);
                if (Math.abs(dot) < check) {
                    if (!this._isClinging) {
                        this.clingToWall(hit.hitNormal);
                    }
                    return true;
                }
            }
        }

        if (this._isClinging) {
            this.onWallExit();
        }
        return false;
    }

    onDestroy() {
        EasyController.off(EasyControllerEvent.MOVEMENT, this.onMovement, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMovementRelease, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onJump, this);
    }

    clingToWall(hitNormal: Vec3) {
        this._isClinging = true;
        this._rigidBody.useGravity = false;
        this._rigidBody.setLinearVelocity(Vec3.ZERO);
        this._rigidBody.enabled = false;

        const wallForward = hitNormal.clone().multiplyScalar(1);
        const up = this.node.up.clone();
        const targetQuat = new Quat();
        Quat.fromViewUp(targetQuat, wallForward, up);
        this.node.setRotation(targetQuat);
    }

    onWallExit() {
        this._isClinging = false;
        this._rigidBody.useGravity = true;
        this._rigidBody.enabled = true;
    }

    @property
    public climbSpeed: number = 5;
    @property({readonly: true, visible: true, serializable: false})
    _isClinging: boolean = false;
    update(deltaTime: number) {
        this._checkStartClimb();

        if (this._isClinging) {
            const vertical = this._moveInputSinus * this.climbSpeed * deltaTime;
            const horizontal = this._moveInputCosinus * this.climbSpeed * deltaTime;
            const localClimb = v3(horizontal, vertical, 0);
            const worldClimb = v3();
            Vec3.transformQuat(worldClimb, localClimb, this.node.worldRotation);
            const originalPos = this.node.position.clone();
            originalPos.add(worldClimb);
            this.node.setPosition(originalPos);
            return;
        }

        if (this._isMoving) {
            this._tmp.set(this.node.forward);
            this._tmp.multiplyScalar(this.velocity * this._velocityScale);
            if (this._rigidBody) {
                this._rigidBody.getLinearVelocity(v3_1);
                this._tmp.y = v3_1.y;
                this._rigidBody.setLinearVelocity(this._tmp);
            }
            else {
                this._tmp.multiplyScalar(deltaTime);
                this._tmp.add(this.node.position);
                this.node.setPosition(this._tmp);
            }
        }

        if (this._isInTheAir) {
            if(this.jumpBeginAnimClip && this._anim){
                let state = this._anim.getState(this.jumpBeginAnimClip.name);
                if(state.isPlaying && state.current >= state.duration){
                    if(this.jumpLoopAnimClip){
                        this._anim.crossFade(this.jumpLoopAnimClip.name);
                    }
                }
            }

            if(!this._rigidBody){
                this._currentVerticalVelocity -= 9.8 * deltaTime;
            
                let oldPos = this.node.position;
                let nextY = oldPos.y + this._currentVerticalVelocity * deltaTime;
                if (nextY <= 0) {
                    this.onLand();
                    nextY = 0.0;
                }
                this.node.setPosition(oldPos.x, nextY, oldPos.z);
            }
        }
    }

    onLand(){
        this._isInTheAir = false;
        this._currentVerticalVelocity = 0.0;
        this._curJumpTimes = 0;
        if (this.moveAnimClip) {
            if(this._isMoving){
                this._anim.crossFade(this.moveAnimClip.name, 0.5);
            }
            else{
                this._anim.crossFade(this.idleAnimClip.name, 0.5);
            }
        }
    }

    private _tmp = v3();
    @property({readonly: true, visible: true, serializable: false})
    private _moveInputDegree: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    private _moveInputOffset: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    private _moveInputSinus: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    private _moveInputCosinus: number = 0;
    onMovement(degree: number, offset: number) {
        this._moveInputDegree = degree;
        this._moveInputOffset = offset;

        const rad = degree * Math.PI / 180;
        this._moveInputCosinus = Math.cos(rad) * offset;
        this._moveInputSinus = Math.sin(rad) * offset;

        let cameraRotationY = 0;
        if (this.mainCamera) {
            cameraRotationY = this.mainCamera.node.eulerAngles.y;
        }
        this._velocityScale = offset;
        //2D界面是 正X 为 0， 3D场景是 正前方为0，所以需要 - 90 度。（顺时针转90度）
        // this._tmp.set(0, cameraRotationY + degree - 90 + 180, 0);
        this._tmp.set(0, cameraRotationY + degree - 90, 0);
        if (!this._isClinging) {
            this.node.setRotationFromEuler(this._tmp);
        }
        if (this._anim) {
            if (!this._isMoving && !this._isInTheAir) {
                if (this.moveAnimClip) {
                    this._anim.crossFade(this.moveAnimClip.name, 0.1);
                }
            }
            if (this.moveAnimClip) {
                this._anim.getState(this.moveAnimClip.name).speed = this._velocityScale;
            }
        }
        this._isMoving = true;

    }
    onMovementRelease() {
        this._moveInputDegree = this._moveInputOffset = 0;
        this._moveInputSinus = this._moveInputCosinus = 0;
        if (!this._isInTheAir && this.idleAnimClip) {
            this._anim?.crossFade(this.idleAnimClip.name, 0.5);
        }
        this._isMoving = false;
        if (this._rigidBody) {
            this._rigidBody.setLinearVelocity(Vec3.ZERO);
        }
    }

    onJump(btnName:string) {
        console.log(btnName);
        if(btnName != 'btn_slot_0'){
            return;
        }
        if (this._curJumpTimes >= this.maxJumpTimes) {
            return;
        }
        if(this._curJumpTimes == 0 || true){
            if(this.jumpBeginAnimClip){
                this._anim?.crossFade(this.jumpBeginAnimClip.name);
            }
        }
        this._curJumpTimes++;
        if(this._rigidBody){
            this._rigidBody.getLinearVelocity(v3_1);
            v3_1.y = this.jumpVelocity;
            this._rigidBody.setLinearVelocity(v3_1);
        }
        else{
            this._currentVerticalVelocity = this.jumpVelocity;
        }
        
        this._isInTheAir = true;
    }
}

