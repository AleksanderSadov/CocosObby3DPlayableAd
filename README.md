# 3D Obby Playable

**Что осталось не сделанным**

1. Свободное движение камеры - начал с не самого подходящего для этого CharacterController с фиксированной камерой, потом нашел более подходящий EasyController, но пока не успел внедрить

**Character Controller**

1. ObbyCharacterController - За основу был взят пример из документации: https://docs.cocos.com/creator/3.8/manual/en/cases-and-tutorials/ -> Examples of Physics -> case-character-controller и модифицировался по необходимости

2. Позже увидел бесплатный EasyController: https://store.cocos.com/app/en/detail/4207 с реализацией тач управления и готовой логикой и моделькой персонажа. Взял оттуда UI, но само управление быстро перенести пока не получилось и оставил пока с начатой CharacterController

**Physics Engine**

https://docs.cocos.com/creator/3.8/manual/en/physics/character-controller/
https://docs.cocos.com/creator/3.8/manual/en/physics/physics-engine.html

В приоритете легковесный движок, т.к. у playable у ad строгие ограничения по размеру файла, например до 4Мб у Unity Ads

1. Cannon.js (141Kb) - легковесный, но он не поддерживает уже выбраный CapsuleCharacterController, но можно еще попробовать персонажа через rigidbody если потребуется

1. **Bullet (1.5Mb) - тяжелее, но работает с CapsuleCharacterController и сейчас выбран он**

1. PhysX - самый точный, но и самый тяжелый
