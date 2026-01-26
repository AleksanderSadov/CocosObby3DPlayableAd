# 3D Obby Playable

**Что осталось не сделанным**

1. Нет билда playable inline одним файлом. mraid соотствественно тоже не проверил. Проверял бы через https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp

**Генерация playable**

1. В кокосе из коробки нет билда именно под playable, но нашел подходящий готовый билдер https://github.com/ppgee/cocos-pnp
1. Сборка playable меню окна Cocos Creator -> Extension -> playable-adapter -> build. Собирается web-mobile билд, учитывается конфиг web-mobile билда, так что там выставляем настройки, но запускаем билд через extension 
1. ВНИМАНИЕ!!! Во время сборки playable билда нужно отключить MD5 Cache, иначе будут ошибки по типу 
```
Google.html:121 SyntaxError: "undefined" is not valid JSON at JSON.parse (<anonymous>) at __adapter_get_imports (Google.html:121:11388842) at window.__adapter_init (Google.html:121:11393758) at __adapter_success (Google.html:121:11395067) at __adapter_exec_js (Google.html:121:11394752) at __adapter_unzip (Google.html:121:11394468) at Google.html:121:11395096 at Google.html:121:11395134
```

**Сторонние библиотеки**

1. [EasyController](https://store.cocos.com/app/en/detail/4207): - логика управления персонажем + интерфейсы для тач джойстика
1. [cocos-pnp](https://github.com/ppgee/cocos-pnp): - сборка playable ad билда
1. ~~[playable-build-tool](https://github.com/minzhi3/playable-build-tool): - сборка playable ad билда. Этот плагин не сработал, были ошибки~~

**Feature Cropping**

1. Например у UnityAds требование inline файл билд не больше 5Мб: https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications
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
