# 3D Obby Playable

**Что осталось не сделанным**

1. Свободное движение камеры - начал с не самого подходящего для этого CharacterController с фиксированной камерой, потом нашел более подходящий EasyController, но пока не успел внедрить

**Генерация playable**

1. Руководствуюсь требованиями UnityAds: https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications
    1. Билд одним inline файлом html
    2. Размер меньше 5 Мб
1. В кокосе из коробки нет билда именно под playable, но нашел подходящий готовый билдер https://store.cocos.com/app/en/detail/3754, в сторе платный но это пожеланию и автор бесплатно выложил на гитхаб: https://github.com/minzhi3/playable-build-tool
    1. В гит запушу плагин, но всем запуллившим нужно последовать инструкции и собрать билд: https://github.com/minzhi3/playable-build-tool
        1. Move all files to extension folder, run npm install and build.
        1. npm install
        1. npm run build
    1. Столкнулся с тем, что изначально не поддерживается последний актуальный Cocos Creator 3.8.8. Для начала достаточно было расширить версии в "editor": "3.2.2 - 3.8.8" в package.json
    1. Другая проблема, что после установки не генерировалась папка билд c playable. Продебажил и оказалось нужно было выкл/вкл флаги Output to playable format при сборке билда. Видимо какая-то путаница с дефолтными значениеми после установки
    1. Автор пишет не поддерживает ammo.js (bullet), но проблем не обнаружено, может уже устаревшая инфа
    1. После сборки была ошибка effect.bin' from origin 'null' has been blocked by CORS policy. Чатгпт направил в нужную сторону, проблема в Render Pipeline. Пока что этот билдер не работает с New Render Pipeline и нужно переключиться на Legacy Render Pipeline.
    1. Несмотря на пару минусов, билдер работает и достаточен для начала или референса

**Character Controller**

1. ObbyCharacterController - За основу был взят пример из документации: https://docs.cocos.com/creator/3.8/manual/en/cases-and-tutorials/ -> Examples of Physics -> case-character-controller и модифицировался по необходимости
1. Позже увидел бесплатный EasyController: https://store.cocos.com/app/en/detail/4207 с реализацией тач управления и готовой логикой и моделькой персонажа. Взял оттуда UI, но само управление быстро перенести пока не получилось и оставил пока с начатой CharacterController

**Physics Engine**

https://docs.cocos.com/creator/3.8/manual/en/physics/character-controller/
https://docs.cocos.com/creator/3.8/manual/en/physics/physics-engine.html

В приоритете легковесный движок, т.к. у playable у ad строгие ограничения по размеру файла, например до 5Мб у Unity Ads

1. Cannon.js (141Kb) - легковесный, но он не поддерживает уже выбраный CapsuleCharacterController, но можно еще попробовать персонажа через rigidbody если потребуется

1. **Bullet (1.5Mb) - тяжелее, но работает с CapsuleCharacterController и сейчас выбран он**

1. PhysX - самый точный, но и самый тяжелый. Точно пока не находил файл и не мерял, но с PhysX playable билд на момент проверки весил на 6 Мб больше чем c bullet (13 Мб против 6 Мб)
