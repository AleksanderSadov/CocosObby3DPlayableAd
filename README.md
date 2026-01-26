# 3D Obby Playable

**Что осталось не сделанным**

1. Нет билда playable inline одним файлом. mraid соотствественно тоже не проверил. Проверял бы через https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp

**Сторонние библиотеки**

1. [EasyController](https://store.cocos.com/app/en/detail/4207): - логика управления персонажем + интерфейсы для тач джойстика
1. [Playable билдер](https://store.cocos.com/app/en/detail/3754): - сборка playable формата

**Feature Cropping**

1. Например у UnityAds требование inline файл билд не больше 5Мб
1. Для проверки запускаю обычный web-mobile билд и в инспекторе сортирую по размеру файлов чтобы расставить приоритеты на что в первую очередь обратить внимание
    1. Убрал HDR скайбоксы ~1-2 Мб. Убрал лишние фичи.
    1. Анимации оставил. Но можно еще посжимать текстуры модели
    1. Ещё ~1.5 Мб можно убрать перейдя с физики bullet на cannon

**Physics Engine**

https://docs.cocos.com/creator/3.8/manual/en/physics/character-controller/
https://docs.cocos.com/creator/3.8/manual/en/physics/physics-engine.html

В приоритете легковесный движок

1. Cannon.js (141Kb) - легковесный, но он не поддерживает CapsuleCharacterController, BoxCharacterController, CapsuleCollider которые часто используются для персонажей. Если потребуется ещё срезать вес и переходить на cannon, то нужно управление персонажей переделывать под BoxCollider

1. **Bullet (1.5Mb) - тяжелее, но работает с CharacterController и CapsuleCollider и сейчас выбран он**

1. PhysX - самый точный, но и самый тяжелый. Точно пока не находил файл и не мерял, но с PhysX playable билд на момент проверки весил на 6 Мб больше чем c bullet (13 Мб против 6 Мб)

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
    1. Ошибка с загрузкой звуков или спрайтов. Можно поискать другое готовое решение или подправить это или написать свое. Думаю одной из проблем был старт на слишком актуальной версии кокоса, где поменялась внутрянка и поломались готовые и устоявшиеся решения
